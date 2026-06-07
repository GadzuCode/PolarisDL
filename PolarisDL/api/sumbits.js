import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    
    if (req.method === 'GET') {
        try {
            const { id_level } = req.query;

            if (!id_level) {
                return res.status(400).json({ error: 'Falta el parámetro Nivel' });
            }

            const { data, error } = await supabase
                .from('Sumbits')
                .select(`
                    Id_Sumbit,
                    Link_Mostrar,
                    Nivel,
                    Player,
                    Jugador:Player ( Nombre )
                `)
                .eq('Nivel', id_level) 
                .eq('Status', 'A');

            if (error) {
                console.error("❌ Error en Supabase:", error.message);
                return res.status(400).json({ error: error.message });
            }

            return res.status(200).json(data);
            
        } catch (err) {
            console.error("❌ Error en el servidor:", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }


    if (req.method === 'POST') {
        try {
            const { Nivel, Player, Link_Mostrar, Link_Raw, Status } = req.body;

            const { data, error } = await supabase
                .from('Sumbits')
                .insert([
                    { 
                        Nivel: Nivel, 
                        Player: Player, 
                        Link_Mostrar: Link_Mostrar, 
                        Link_Raw: Link_Raw, 
                        Status: Status || 'P' 
                    }
                ])
                .select(); 

            if (error) {
                console.error("Error en Supabase:", error.message);
                return res.status(400).json({ error: error.message });
            }

            return res.status(201).json(data);

        } catch (err) {
            console.error("Error del servidor:", err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Si mandan un método raro (PUT, DELETE)
    return res.status(405).json({ error: 'Método no permitido' });
}