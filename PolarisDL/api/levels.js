import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { data, error } = await supabase
            .from('Levels')
            .select(`
                Nombre_Nivel,
                ID_Level,
                Id_Gd,
                Link_Showcase,
                Top,
                Creador:ID_Creador ( Nombre ),
                Verificador:ID_Verificador ( Nombre ),
                Puntos:Top ( Puntos )
            `)
            .order('Top', { ascending: true })
            .limit(100);

        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        return res.status(200).json(data);
        
    } catch (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}