// @vitest-environment jsdom

import { render, screen, fireEvent, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Modal } from '../modal';

/**
 * O jsdom não implementa showModal/close; sem estes stubs o componente lança.
 * A classe `open` é a única parte do comportamento nativo que o teste precisa.
 */
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    // O navegador emite `close` quando o fechamento parte de fora (ESC).
    this.dispatchEvent(new Event('close'));
  });
});

function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onClose = vi.fn();
  const utils = render(
    <Modal isOpen title="Excluir equipamento" onClose={onClose} {...props}>
      {props.children}
    </Modal>,
  );
  const dialog = utils.container.querySelector('dialog') as HTMLDialogElement;
  return { ...utils, onClose, dialog };
}

describe('Modal', () => {
  describe('AUD-25: botão de fechar', () => {
    it('mostra o botão de fechar em modal de confirmação', () => {
      const { onClose } = renderModal();

      fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('mostra o botão de fechar também quando há children', () => {
      const { onClose } = renderModal({
        children: <input aria-label="Nome" />,
        title: 'Novo equipamento',
      });

      expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
      expect(screen.getByLabelText('Nome')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('esconde o botão com hideClose, quando o modal já expõe um Cancelar próprio', () => {
      renderModal({ hideClose: true, children: <button type="button">Cancelar</button> });

      expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('desabilita o botão de fechar enquanto processa', () => {
      renderModal({ isLoading: true });

      expect(screen.getByRole('button', { name: 'Fechar' })).toBeDisabled();
    });
  });

  describe('AUD-25: foco', () => {
    it('ao abrir, foca o primeiro campo do conteúdo e não o botão de fechar', () => {
      renderModal({ children: <input aria-label="Nome" /> });

      expect(screen.getByLabelText('Nome')).toHaveFocus();
    });

    it('modal de confirmação foca o Cancelar do rodapé, não o fechar', () => {
      renderModal();

      expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    });

    it('devolve o foco ao elemento que abriu o modal depois de fechar', () => {
      const opener = document.createElement('button');
      opener.textContent = 'Novo equipamento';
      document.body.appendChild(opener);
      opener.focus();

      const { rerender, onClose, dialog } = renderModal({ children: <input aria-label="Nome" /> });
      expect(screen.getByLabelText('Nome')).toHaveFocus();

      // O dono do estado fecha: o efeito chama dialog.close(), o jsdom tira o
      // `open` e emite `close` — o mesmo caminho do ESC no navegador real.
      rerender(
        <Modal isOpen={false} onClose={onClose} title="Novo equipamento">
          {null}
        </Modal>,
      );
      expect(dialog).not.toHaveAttribute('open');

      act(() => {
        opener.focus();
      });
      expect(document.activeElement).toBe(opener);
      opener.remove();
    });
  });

  describe('AUD-25: fechamento por ESC e backdrop', () => {
    /**
     * O navegador despacha `cancel` ANTES de fechar o <dialog>; fechar numa
     * execução cancelada é o que impediria o fechamento nativo. O jsdom não
     * implementa esse passo — daí o stub com esta lógica.
     */
    function cancelClosesDialog(dialog: HTMLDialogElement) {
      const cancel = new Event('cancel', { cancelable: true });
      dialog.dispatchEvent(cancel);
      if (!cancel.defaultPrevented) dialog.close();
      return cancel;
    }

    it('ESC com hideClose não fecha: o Cancelar do formulário é o caminho', () => {
      const { dialog, onClose } = renderModal({ hideClose: true, children: <input aria-label="Nome" /> });

      cancelClosesDialog(dialog);

      expect(onClose).not.toHaveBeenCalled();
      expect(dialog).toHaveAttribute('open');
    });

    it('ESC com processamento em andamento é ignorado', () => {
      const { dialog, onClose } = renderModal({ isLoading: true });

      cancelClosesDialog(dialog);

      expect(onClose).not.toHaveBeenCalled();
      expect(dialog).toHaveAttribute('open');
    });

    it('ESC segue o mesmo caminho do backdrop e fecha pelo dono do estado', () => {
      const { dialog, onClose } = renderModal({ children: <input aria-label="Nome" /> });

      cancelClosesDialog(dialog);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clique no backdrop fecha, mas clique dentro do conteúdo não', () => {
      const { onClose, dialog } = renderModal({ children: <input aria-label="Nome" /> });

      fireEvent.click(screen.getByLabelText('Nome'));
      expect(onClose).not.toHaveBeenCalled();

      fireEvent.click(dialog);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('não fecha pelo backdrop enquanto processa', () => {
      const { onClose, dialog } = renderModal({ isLoading: true });

      fireEvent.click(dialog);

      expect(onClose).not.toHaveBeenCalled();
      expect(dialog).toHaveAttribute('open');
    });
  });

  describe('acessibilidade', () => {
    it('o título identifica o dialog e o id é estável entre renders', () => {
      const { dialog, rerender } = renderModal();
      const heading = screen.getByRole('heading', { name: 'Excluir equipamento' });

      expect(dialog).toHaveAttribute('aria-labelledby', heading.id);

      rerender(<Modal isOpen title="Excluir equipamento" onClose={vi.fn()} />);
      expect(screen.getByRole('heading', { name: 'Excluir equipamento' }).id).toBe(heading.id);
    });

    it('aceita um titleId externo para o dono referenciar no aria-labelledby', () => {
      const { dialog } = renderModal({ titleId: 'modal-title' });

      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(screen.getByRole('heading', { name: 'Excluir equipamento' })).toHaveAttribute('id', 'modal-title');
    });
  });
});
