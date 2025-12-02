-- Create return_requests table
CREATE TABLE IF NOT EXISTS public.return_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    return_type TEXT NOT NULL CHECK (return_type IN ('refund', 'replace')),
    reason TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON public.return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON public.return_requests(status);
CREATE INDEX IF NOT EXISTS idx_return_requests_created_at ON public.return_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for return_requests
-- Users can view their own return requests
CREATE POLICY "Users can view own return requests"
    ON public.return_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own return requests
CREATE POLICY "Users can create own return requests"
    ON public.return_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all return requests
CREATE POLICY "Admins can view all return requests"
    ON public.return_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admins can update all return requests
CREATE POLICY "Admins can update all return requests"
    ON public.return_requests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_return_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_return_requests_updated_at
    BEFORE UPDATE ON public.return_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_return_requests_updated_at();

-- Add comment to table
COMMENT ON TABLE public.return_requests IS 'Stores customer return requests for orders with refund or replacement options';
