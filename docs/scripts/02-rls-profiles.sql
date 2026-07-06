-- POLICY: SELECT - usuario so ve seu proprio perfil
CREATE POLICY "Usuarios podem ver seu proprio perfil"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- POLICY: UPDATE - usuario so edita seu proprio perfil
CREATE POLICY "Usuarios podem editar seu proprio perfil"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Nao criamos policy de INSERT porque o trigger cuida disso
-- Nao criamos policy de DELETE porque perfis nao devem ser deletados manualmente
