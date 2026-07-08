-- Bucket público para logos de usuario (subida solo vía service role en el servidor).
-- Ejecutar en el SQL Editor de Supabase después de crear el bucket `user-logos` como público.

-- Lectura pública de objetos en user-logos
CREATE POLICY "Public read user logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-logos');

-- Sin políticas INSERT/UPDATE/DELETE para anon/authenticated:
-- la app sube con SUPABASE_SERVICE_ROLE_KEY en Server Actions.
