import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { data, error } = await supabase
            .from('ranking') 
            .select('*'); 
          
        if (error) {
            console.error("Error al consultar la vista:", error.message);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error("Error en el servidor:", err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}