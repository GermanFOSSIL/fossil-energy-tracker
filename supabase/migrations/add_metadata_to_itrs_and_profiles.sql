
-- Add metadata column to itrs table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'itrs' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.itrs ADD COLUMN metadata JSONB DEFAULT NULL;
    END IF;

    -- Add metadata column to profiles table if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN metadata JSONB DEFAULT NULL;
    END IF;
END
$$;
