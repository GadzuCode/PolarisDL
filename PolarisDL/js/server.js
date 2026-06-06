import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());
app.use(cors()); 

const SUPABASE_URL = 'https://phjrcdjjftlvarupieyk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_A1nmH7cSLTR0as3dTyEmOw_6ku0MNO3';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Creamos la "ventanilla" (Ruta API) donde tu HTML irá a pedir los niveles
app.get('/api/levels', async (req, res) => {
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

        // Si todo sale bien, le respondemos el JSON limpio a tu HTML
        
        return res.json(data);
        
    } catch (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/sumbits', async (req, res) => {
    try {
        const { id_level } = req.query;

        if (!id_level) {
            return res.status(400).json({ error: 'Falta el parámetro Nivel' });
        }

        // 🌟 SELECT LIMPIO: Con '*' le decimos que traiga solo los datos nativos de la tabla Sumbits
        // Evitamos usar relaciones anidadas que rompan el caché de Supabase
        const { data, error } = await supabase
            .from('Sumbits')
            .select(`
                Id_Sumbit,
                Link_Mostrar,
                Nivel,
                Player,
                Jugador:Player ( Nombre )  <-- ¡INTENTEMOS TRAER EL NOMBRE ASÍ!
            `)
            .eq('Nivel', id_level) // Asegúrate de que en la tabla 'Sumbits' la columna se llame así
            .eq('Status', 'A');
        if (error) {
            console.error("❌ Error en Supabase:", error.message);
            return res.status(400).json({ error: error.message });
        }

        return res.json(data);
        
    } catch (err) {
        console.error("❌ Error en el servidor:", err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/players', async (req, res) => {
    try {
       
        const { data, error } = await supabase
            .from('Players')
            .select(`
                ID_plyr,
                Nombre
            `)
        if (error) {
            console.error("❌ Error en Supabase:", error.message);
            return res.status(400).json({ error: error.message });
        }

        return res.json(data);
        
    } catch (err) {
        console.error("❌ Error en el servidor:", err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

const PUERTO = 3000;
app.listen(PUERTO, () => {
    console.log(`🚀 Servidor backend corriendo en: http://localhost:${PUERTO}`);
});

app.post('/api/sumbits', async (req, res) => {
   console.log("Lo que llegó al body:", req.body);
    try {
        // 1. Extraemos los datos que el formulario mandó en el body
        const { Nivel, Player, Link_Mostrar, Link_Raw, Status } = req.body;

        // 2. Insertamos la nueva fila en la tabla de Supabase
        const { data, error } = await supabase
            .from('Sumbits')
            .insert([
                { 
                    Nivel: Nivel, 
                    Player: Player, 
                    Link_Mostrar: Link_Mostrar, 
                    Link_Raw: Link_Raw, 
                    Status: Status || 'P' // Si no viene estado, entra como Pendiente ('P')
                }
            ])
            .select(); // El .select() es para que nos devuelva el registro creado

        // 3. Si Supabase responde con un error (ej. el ID no existe)
        if (error) {
            console.error("Error en Supabase:", error.message);
            return res.status(400).json({ error: error.message });
        }

        // 4. Si todo salió chido, respondemos al frontend con los datos creados
        return res.status(201).json(data);

    } catch (err) {
        console.error("Error del servidor:", err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/ranking', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ranking') // 👈 Pon aquí el nombre exacto de tu Vista
            .select('*') 
          
        if (error) {
            console.error("Error al consultar la vista:", error.message);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error("Error en el servidor:", err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});