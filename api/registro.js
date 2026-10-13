export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const {
    firstname,
    lastname,
    correo,
    phone,
    course,
    modalidad,
    costo_final,
    status,
    matricula,
    grado_estudios,
    factura,
    medio
  } = req.body;

  const AC_URL = process.env.ACTIVECAMPAIGN_URL; 
  const AC_KEY = process.env.ACTIVECAMPAIGN_KEY;
  const PIPELINE_ID = process.env.AC_PIPELINE_ID;
  const STAGE_ID = process.env.AC_STAGE_ID;

  const headers = {
    'Api-Token': AC_KEY,
    'Content-Type': 'application/json',
  };

  try {
    // Step 1: Crear o actualizar el Contacto
    const contactRes = await fetch(`${AC_URL}/api/3/contact/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contact: {
          email: correo,
          firstName: firstname,
          lastName: lastname,
          phone: phone,
        },
      }),
    });

    const contactData = await contactRes.json();
    const contactId = contactData.contact.id;

    // Step 2: Crear el Trato (Deal) en la etapa "LEAD" del embudo "SEMESTRALES 2027-1"
    const dealTitle = `${course} - ${firstname} ${lastname}`;
    const valueInCents = Math.round(
      parseFloat(costo_final.replace(/[^0-9.-]+/g, '')) * 100
    ) || 0;

    await fetch(`${AC_URL}/api/3/deals`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        deal: {
          title: dealTitle,
          contact: contactId,
          group: PIPELINE_ID, // ID del embudo SEMESTRALES 2027-1
          stage: STAGE_ID,    // ID de la etapa LEAD
          value: valueInCents,
          currency: 'mxn',
          status: 0, // 0 = Abierto
        },
      }),
    });

    return res.status(200).json({ success: true, message: 'Registro completado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}