// @vitest-environment jsdom

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeSwitcher } from '../theme-switcher';

const mockSetTheme = vi.fn();
let mockResolvedTheme = 'dark';

vi.mock('next-themes', () => ({
    useTheme: () => ({
        theme: mockResolvedTheme,
        resolvedTheme: mockResolvedTheme,
        setTheme: mockSetTheme,
    }),
}));

describe('ThemeSwitcher', () => {
    it('renderiza o botão com label acessível para alternar para modo claro quando estiver no escuro', () => {
        mockResolvedTheme = 'dark';
        render(<ThemeSwitcher />);

        const button = screen.getByRole('button', { name: /Alternar para modo claro/i });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('renderiza o botão com label acessível para alternar para modo escuro quando estiver no claro', () => {
        mockResolvedTheme = 'light';
        render(<ThemeSwitcher />);

        const button = screen.getByRole('button', { name: /Alternar para modo escuro/i });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
});
