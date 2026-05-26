import { useParams, Link } from 'react-router-dom'

// ── Helpers de estilo ──────────────────────────────────────────
const h2Style: React.CSSProperties = {
  fontSize: 15, fontWeight: 700, color: '#fff',
  letterSpacing: '-0.01em', margin: '40px 0 12px',
}
const pStyle: React.CSSProperties = {
  fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: '0 0 14px',
}
const liStyle: React.CSSProperties = {
  fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 6,
}
const emailLink = (addr: string) => (
  <a href={`mailto:${addr}`} style={{ color: 'rgba(255,159,10,0.85)', textDecoration: 'none' }}>{addr}</a>
)
const divider = (
  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '32px 0' }} />
)

// ── Contenido por slug ─────────────────────────────────────────
function Privacidad() {
  return (
    <>
      <p style={pStyle}>
        En cumplimiento con la <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Ley Federal de Protección de Datos Personales en Posesión de los Particulares</strong>, su Reglamento y demás disposiciones aplicables en los Estados Unidos Mexicanos, se pone a disposición de los usuarios, prospectos y clientes el presente Aviso de Privacidad.
      </p>

      {divider}

      <h2 style={h2Style}>I. Responsable del tratamiento de datos personales</h2>
      <p style={pStyle}>
        Daniel Quintana, prestador de servicios profesionales de marketing digital, con operación en Chihuahua, Chihuahua, México, es responsable del tratamiento, uso, almacenamiento y protección de los datos personales que sean recabados a través de este sitio web, formularios de contacto, mensajes por WhatsApp, correo electrónico, redes sociales, llamadas telefónicas o cualquier otro medio de comunicación relacionado con la prestación de servicios.
      </p>
      <p style={{ ...pStyle, marginBottom: 6 }}><strong style={{ color: 'rgba(255,255,255,0.65)' }}>Medios de contacto del responsable:</strong></p>
      <ul style={{ margin: '0 0 14px', paddingLeft: 20 }}>
        <li style={liStyle}>Correo electrónico: {emailLink('daniel.chquintana@gmail.com')}</li>
        <li style={liStyle}>Teléfono / WhatsApp: +52 614 304 1750</li>
        <li style={liStyle}>Ubicación: Chihuahua, Chihuahua, México</li>
      </ul>

      {divider}

      <h2 style={h2Style}>II. Datos personales que se recopilan</h2>
      <p style={pStyle}>Para brindar información, cotizaciones, seguimiento comercial y prestación de servicios, se podrán recopilar los siguientes datos personales:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Nombre completo.',
          'Nombre comercial o razón social del negocio.',
          'Correo electrónico.',
          'Número telefónico y/o WhatsApp.',
          'Ciudad, estado o ubicación general del negocio.',
          'Redes sociales, páginas web, perfiles comerciales o activos digitales del negocio.',
          'Información relacionada con productos, servicios, objetivos comerciales, presupuesto publicitario y necesidades de marketing.',
          'Datos de facturación, únicamente cuando sean necesarios.',
          'Comprobantes de pago, referencias de pago o información necesaria para confirmar la contratación del servicio.',
          'Materiales proporcionados por el cliente, tales como logotipos, fotografías, videos, textos, imágenes, accesos publicitarios o información comercial necesaria para ejecutar los servicios contratados.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>El responsable no solicita datos personales sensibles, salvo que el propio titular los proporcione voluntariamente y sean necesarios para una finalidad específica relacionada con el servicio. En caso de no ser necesarios, dichos datos no serán utilizados.</p>

      {divider}

      <h2 style={h2Style}>III. Finalidades del tratamiento de datos personales</h2>
      <p style={pStyle}>Los datos personales recabados serán utilizados para las siguientes <strong style={{ color: 'rgba(255,255,255,0.65)' }}>finalidades primarias</strong>:</p>
      <ol style={{ margin: '0 0 20px', paddingLeft: 22 }}>
        {[
          'Identificar al usuario, prospecto o cliente.',
          'Atender solicitudes de información, cotización o contratación.',
          'Dar seguimiento a conversaciones comerciales por correo electrónico, WhatsApp, redes sociales o llamada telefónica.',
          'Elaborar propuestas comerciales, cotizaciones, contratos, recibos o comprobantes relacionados con los servicios.',
          'Prestar servicios de publicidad pagada en Meta Ads, manejo de redes sociales, diseño o desarrollo de páginas web, consultoría digital y servicios relacionados.',
          'Configurar, administrar, optimizar o dar seguimiento a campañas publicitarias, cuando el cliente otorgue los accesos necesarios.',
          'Elaborar piezas gráficas, textos, anuncios, reportes, análisis, estrategias, páginas web o materiales digitales relacionados con el servicio contratado.',
          'Mantener comunicación con el cliente durante la vigencia del servicio.',
          'Cumplir obligaciones contractuales, administrativas, fiscales o legales aplicables.',
          'Atender aclaraciones, quejas, solicitudes de soporte o seguimiento posterior al servicio.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>De forma adicional, los datos podrán utilizarse para las siguientes <strong style={{ color: 'rgba(255,255,255,0.65)' }}>finalidades secundarias</strong>:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Enviar información sobre nuevos servicios, promociones, recomendaciones, actualizaciones o contenido relacionado con marketing digital.',
          'Utilizar casos de éxito, resultados generales o piezas creativas en portafolio profesional, siempre procurando no divulgar información confidencial, sensible o económica específica del cliente sin autorización.',
          'Mejorar la experiencia del usuario en el sitio web y en los canales de contacto.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>El titular podrá oponerse al uso de sus datos para finalidades secundarias enviando una solicitud al correo: {emailLink('daniel.chquintana@gmail.com')}.</p>

      {divider}

      <h2 style={h2Style}>IV. Transferencia de datos personales</h2>
      <p style={pStyle}>Los datos personales no serán vendidos, alquilados ni comercializados con terceros.</p>
      <p style={pStyle}>No obstante, podrán compartirse únicamente cuando sea necesario para cumplir con las finalidades descritas en este Aviso de Privacidad, por ejemplo:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Plataformas publicitarias como Meta Ads, Facebook, Instagram, Google u otras herramientas digitales utilizadas para la prestación del servicio.',
          'Proveedores de hosting, dominio, correo electrónico, analítica web, formularios, automatización, almacenamiento en la nube, diseño, desarrollo web o herramientas de gestión digital.',
          'Autoridades competentes, cuando exista requerimiento legal o mandato aplicable.',
          'Profesionistas o colaboradores que apoyen en la ejecución del servicio, siempre bajo deber de confidencialidad.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>Cuando la transferencia requiera consentimiento del titular conforme a la legislación aplicable, este será solicitado previamente.</p>

      {divider}

      <h2 style={h2Style}>V. Protección y conservación de los datos</h2>
      <p style={pStyle}>El responsable adoptará medidas administrativas, técnicas y razonables para proteger los datos personales contra daño, pérdida, alteración, destrucción, uso, acceso o tratamiento no autorizado.</p>
      <p style={pStyle}>Los datos personales serán conservados durante el tiempo necesario para cumplir con las finalidades para las que fueron recabados, para atender obligaciones legales o contractuales, y posteriormente podrán ser bloqueados o eliminados conforme resulte procedente.</p>

      {divider}

      <h2 style={h2Style}>VI. Derechos ARCO</h2>
      <p style={pStyle}>El titular de los datos personales podrá ejercer en cualquier momento sus derechos de <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Acceso, Rectificación, Cancelación y Oposición</strong>, conocidos como derechos ARCO. Estos derechos permiten conocer qué datos se tienen, solicitar su corrección, pedir su eliminación cuando proceda u oponerse a determinados tratamientos.</p>
      <p style={pStyle}>Para ejercer derechos ARCO, el titular deberá enviar una solicitud al correo: {emailLink('daniel.chquintana@gmail.com')}</p>
      <p style={{ ...pStyle, marginBottom: 6 }}>La solicitud deberá incluir:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Nombre completo del titular.',
          'Medio de contacto para responder la solicitud.',
          'Descripción clara del derecho que desea ejercer.',
          'Datos personales sobre los que desea ejercer el derecho.',
          'Documento que acredite su identidad o, en su caso, la representación legal.',
          'Cualquier información adicional que facilite la localización de los datos.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>La solicitud será atendida conforme a los plazos y procedimientos establecidos por la legislación aplicable en materia de protección de datos personales.</p>

      {divider}

      <h2 style={h2Style}>VII. Revocación del consentimiento</h2>
      <p style={pStyle}>El titular podrá revocar su consentimiento para el tratamiento de sus datos personales, siempre que legal o contractualmente resulte procedente, enviando una solicitud al correo electrónico: {emailLink('daniel.chquintana@gmail.com')}</p>
      <p style={pStyle}>La revocación no tendrá efectos retroactivos y no podrá afectar tratamientos necesarios para cumplir obligaciones legales, contractuales o administrativas previamente adquiridas.</p>

      {divider}

      <h2 style={h2Style}>VIII. Uso de cookies y tecnologías similares</h2>
      <p style={pStyle}>Este sitio web podrá utilizar cookies, píxeles, etiquetas, herramientas de analítica o tecnologías similares para mejorar la experiencia del usuario, medir visitas, analizar el comportamiento dentro del sitio y optimizar campañas publicitarias.</p>
      <p style={pStyle}>Para más información, consultar la Política de Cookies publicada en este mismo sitio web.</p>

      {divider}

      <h2 style={h2Style}>IX. Cambios al Aviso de Privacidad</h2>
      <p style={pStyle}>El presente Aviso de Privacidad podrá modificarse o actualizarse en cualquier momento para cumplir cambios legales, necesidades operativas, nuevos servicios o ajustes en las prácticas de tratamiento de datos.</p>
      <p style={pStyle}>Cualquier modificación será publicada en este mismo sitio web, indicando la fecha de última actualización.</p>
    </>
  )
}

function Cookies() {
  return (
    <>
      <p style={pStyle}>
        La presente Política de Cookies explica qué son las cookies, qué tipo de tecnologías similares pueden utilizarse en este sitio web y cómo el usuario puede administrarlas o desactivarlas.
      </p>

      {divider}

      <h2 style={h2Style}>I. ¿Qué son las cookies?</h2>
      <p style={pStyle}>
        Las cookies son pequeños archivos de texto que un sitio web puede almacenar en el navegador o dispositivo del usuario cuando visita una página. Estas permiten recordar cierta información sobre la navegación, mejorar la experiencia del usuario, medir el uso del sitio y, en algunos casos, mostrar publicidad personalizada o medir el rendimiento de campañas.
      </p>

      {divider}

      <h2 style={h2Style}>II. Tecnologías que pueden utilizarse</h2>
      <p style={pStyle}>
        Este sitio web podrá utilizar cookies, píxeles, etiquetas, scripts, identificadores de dispositivo, herramientas de analítica web y tecnologías similares.
      </p>
      <p style={pStyle}>
        Estas tecnologías podrán ser propias o de terceros, dependiendo de las herramientas utilizadas para operar, analizar o promocionar el sitio.
      </p>

      {divider}

      <h2 style={h2Style}>III. Tipos de cookies que puede utilizar este sitio</h2>
      <p style={{ ...pStyle, marginBottom: 6 }}><strong style={{ color: 'rgba(255,255,255,0.65)' }}>a) Cookies necesarias</strong></p>
      <p style={pStyle}>Son indispensables para el funcionamiento básico del sitio web. Permiten cargar correctamente la página, mantener seguridad, enviar formularios o habilitar funciones esenciales.</p>
      <p style={pStyle}>Estas cookies no requieren consentimiento previo cuando son estrictamente necesarias para prestar el servicio solicitado por el usuario.</p>
      <p style={{ ...pStyle, marginBottom: 6 }}><strong style={{ color: 'rgba(255,255,255,0.65)' }}>b) Cookies de rendimiento y analítica</strong></p>
      <p style={pStyle}>Permiten conocer cómo los usuarios interactúan con el sitio web, qué secciones visitan, cuánto tiempo permanecen en la página, desde qué dispositivo navegan y qué acciones realizan.</p>
      <p style={pStyle}>Esta información se utiliza para mejorar el sitio, optimizar la comunicación y entender el rendimiento general de la página.</p>
      <p style={{ ...pStyle, marginBottom: 6 }}><strong style={{ color: 'rgba(255,255,255,0.65)' }}>c) Cookies de publicidad y remarketing</strong></p>
      <p style={pStyle}>Pueden utilizarse para medir la efectividad de campañas publicitarias, mostrar anuncios relevantes, crear audiencias, dar seguimiento a conversiones o mejorar campañas en plataformas como Meta Ads, Facebook, Instagram, Google Ads u otras plataformas digitales.</p>
      <p style={{ ...pStyle, marginBottom: 6 }}><strong style={{ color: 'rgba(255,255,255,0.65)' }}>d) Cookies de funcionalidad</strong></p>
      <p style={pStyle}>Permiten recordar preferencias del usuario, mejorar la experiencia de navegación o facilitar interacciones dentro del sitio web.</p>

      {divider}

      <h2 style={h2Style}>IV. Finalidades del uso de cookies</h2>
      <p style={{ ...pStyle, marginBottom: 6 }}>Las cookies y tecnologías similares podrán utilizarse para:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Garantizar el funcionamiento correcto del sitio web.',
          'Recordar preferencias del usuario.',
          'Medir visitas, clics, formularios enviados y comportamiento de navegación.',
          'Analizar el rendimiento del sitio web.',
          'Mejorar la experiencia del usuario.',
          'Optimizar campañas publicitarias.',
          'Medir conversiones generadas por anuncios.',
          'Mostrar publicidad relacionada con los servicios ofrecidos.',
          'Detectar errores técnicos o problemas de navegación.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>

      {divider}

      <h2 style={h2Style}>V. Cookies de terceros</h2>
      <p style={pStyle}>
        Este sitio web podrá utilizar herramientas de terceros, tales como Meta Pixel, Google Analytics, Google Tag Manager, Google Ads, plataformas de hosting, formularios, CRM, WhatsApp, redes sociales u otras herramientas digitales.
      </p>
      <p style={pStyle}>
        Dichos terceros podrán recopilar información conforme a sus propias políticas de privacidad y cookies. El usuario puede consultar directamente las políticas de dichas plataformas para conocer más sobre su tratamiento de datos.
      </p>

      {divider}

      <h2 style={h2Style}>VI. Cómo desactivar o administrar cookies</h2>
      <p style={pStyle}>El usuario puede permitir, bloquear, eliminar o desactivar cookies desde la configuración de su navegador.</p>
      <p style={pStyle}>Generalmente, esta opción se encuentra en las secciones de "Privacidad", "Seguridad", "Cookies" o "Configuración del sitio" del navegador utilizado.</p>
      <p style={{ ...pStyle, marginBottom: 6 }}>El usuario puede administrar cookies en navegadores como:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Google Chrome.',
          'Safari.',
          'Mozilla Firefox.',
          'Microsoft Edge.',
          'Opera.',
          'Navegadores móviles en iOS o Android.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>La desactivación de ciertas cookies puede afectar el funcionamiento del sitio web o limitar algunas funciones.</p>

      {divider}

      <h2 style={h2Style}>VII. Consentimiento</h2>
      <p style={pStyle}>
        Al continuar navegando en este sitio web, el usuario acepta el uso de cookies conforme a la presente Política de Cookies, salvo que las desactive desde su navegador o mediante las herramientas de consentimiento que, en su caso, se encuentren disponibles en el sitio.
      </p>

      {divider}

      <h2 style={h2Style}>VIII. Cambios en la Política de Cookies</h2>
      <p style={pStyle}>Esta Política de Cookies podrá actualizarse en cualquier momento por cambios técnicos, legales, comerciales o por la incorporación de nuevas herramientas digitales.</p>
      <p style={pStyle}>Las modificaciones serán publicadas en este mismo sitio web con la fecha de última actualización.</p>
    </>
  )
}

function Terminos() {
  return (
    <>
      <p style={pStyle}>
        Los presentes Términos y Condiciones regulan el acceso, uso, navegación, contratación y pago de los servicios ofrecidos por Daniel Quintana a través de este sitio web, redes sociales, formularios, WhatsApp, correo electrónico o cualquier otro canal digital relacionado.
      </p>
      <p style={pStyle}>
        Al solicitar información, contratar un servicio, realizar un pago o utilizar este sitio web, el usuario o cliente acepta los presentes Términos y Condiciones.
      </p>

      {divider}

      <h2 style={h2Style}>I. Identidad del prestador</h2>
      <p style={pStyle}>El prestador de los servicios es Daniel Quintana, con operación en Chihuahua, Chihuahua, México.</p>
      <p style={{ ...pStyle, marginBottom: 6 }}><strong style={{ color: 'rgba(255,255,255,0.65)' }}>Medios de contacto:</strong></p>
      <ul style={{ margin: '0 0 14px', paddingLeft: 20 }}>
        <li style={liStyle}>Correo electrónico: {emailLink('daniel.chquintana@gmail.com')}</li>
        <li style={liStyle}>Teléfono / WhatsApp: +52 614 304 1750</li>
      </ul>

      {divider}

      <h2 style={h2Style}>II. Servicios ofrecidos</h2>
      <p style={pStyle}>Los servicios ofrecidos podrán incluir, de manera enunciativa mas no limitativa:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Publicidad pagada en Meta Ads, Facebook Ads e Instagram Ads.',
          'Estrategia, configuración, ejecución y optimización de campañas publicitarias.',
          'Manejo de redes sociales.',
          'Diseño de piezas gráficas o audiovisuales para uso digital.',
          'Creación, diseño, rediseño o desarrollo de páginas web.',
          'Asesoría estratégica de marketing digital.',
          'Reportes de desempeño publicitario.',
          'Optimización de comunicación, posicionamiento, contenido o embudos digitales.',
          'Servicios complementarios acordados por escrito con el cliente.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>El alcance específico de cada servicio dependerá del plan, cotización, propuesta comercial, contrato, mensaje escrito o acuerdo aceptado por el cliente.</p>

      {divider}

      <h2 style={h2Style}>III. Naturaleza del servicio</h2>
      <p style={pStyle}>Los servicios prestados son de carácter profesional, independiente y civil. No existe relación laboral, subordinación, sociedad, asociación, representación legal, agencia, franquicia ni relación de exclusividad entre el prestador y el cliente.</p>
      <p style={pStyle}>Daniel Quintana actúa únicamente como proveedor de servicios de marketing digital, publicidad, diseño, comunicación o desarrollo web. En ningún caso participa en la administración, operación, dirección, contabilidad, producción, cumplimiento fiscal, cumplimiento laboral, entrega de productos o toma de decisiones internas del negocio del cliente.</p>

      {divider}

      <h2 style={h2Style}>IV. Alcance de campañas publicitarias</h2>
      <p style={pStyle}>Cuando el servicio contratado incluya publicidad pagada, el prestador podrá realizar actividades como:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Diseño de estrategia publicitaria inicial.',
          'Configuración de campañas en plataformas digitales.',
          'Elaboración o adaptación de piezas creativas.',
          'Segmentación, pruebas, optimización y seguimiento.',
          'Revisión de métricas y reportes de desempeño.',
          'Recomendaciones estratégicas para mejorar la comunicación comercial.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>El cliente reconoce que las plataformas publicitarias, incluyendo Meta Ads, Facebook, Instagram u otras, son servicios de terceros, por lo que sus políticas, revisiones, restricciones, rechazos, bloqueos, cambios de algoritmo, costos, alcances y funcionamiento no dependen del prestador.</p>

      {divider}

      <h2 style={h2Style}>V. Presupuesto publicitario</h2>
      <p style={pStyle}>El presupuesto destinado a publicidad en plataformas digitales es independiente de los honorarios del prestador.</p>
      <p style={pStyle}>Salvo acuerdo expreso en contrario, el cliente deberá pagar directamente a las plataformas publicitarias el presupuesto destinado a anuncios mediante su propio método de pago.</p>
      <p style={pStyle}>El prestador no estará obligado a absorber, adelantar, financiar ni administrar presupuesto publicitario del cliente.</p>
      <p style={pStyle}>El cliente reconoce que un presupuesto publicitario insuficiente puede limitar el alcance, la velocidad de aprendizaje del algoritmo, la generación de datos, la optimización y los resultados de las campañas.</p>

      {divider}

      <h2 style={h2Style}>VI. Precios y pagos</h2>
      <p style={pStyle}>Los precios de los servicios podrán variar según el alcance, complejidad, entregables, duración y necesidades del cliente.</p>
      <p style={pStyle}>Los servicios tienen precios desde $3,990.00 MXN, salvo que se indique una cantidad distinta en la cotización, propuesta, contrato, página de pago o comunicación escrita correspondiente.</p>
      <p style={pStyle}>Para iniciar cualquier servicio, el cliente deberá realizar el pago correspondiente conforme a las condiciones indicadas en la cotización, contrato o página de pago.</p>
      <p style={pStyle}>Los servicios no iniciarán hasta que el prestador confirme la recepción del pago correspondiente y cuente con la información, accesos, materiales o instrucciones necesarias para comenzar.</p>

      {divider}

      <h2 style={h2Style}>VII. No reembolso una vez iniciado el servicio</h2>
      <p style={pStyle}>Una vez iniciado el servicio, no procederá devolución total ni parcial de los honorarios pagados, bajo ninguna circunstancia.</p>
      <p style={{ ...pStyle, marginBottom: 6 }}>Se entenderá que el servicio ha iniciado cuando ocurra cualquiera de los siguientes supuestos:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'El prestador confirme la recepción del pago.',
          'El prestador solicite o reciba información, accesos, materiales, brief o instrucciones del cliente.',
          'Se inicie la planeación, estrategia, diseño, configuración, investigación, análisis, desarrollo, instalación, redacción o cualquier actividad relacionada con el servicio contratado.',
          'Se cree, configure o revise una campaña, página web, diseño, documento, cuenta, pieza gráfica, contenido o activo digital del cliente.',
          'Se agende o realice una reunión, asesoría o revisión relacionada con el servicio contratado.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>Esta política se justifica por el tiempo, recursos, planeación, disponibilidad, experiencia profesional y trabajo operativo comprometido desde el inicio del servicio.</p>

      {divider}

      <h2 style={h2Style}>VIII. Obligaciones del prestador</h2>
      <p style={{ ...pStyle, marginBottom: 6 }}>El prestador se obliga a:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Ejecutar los servicios contratados con diligencia y profesionalismo.',
          'Realizar las actividades pactadas conforme al alcance acordado.',
          'Mantener comunicación razonable con el cliente durante la ejecución del servicio.',
          'Realizar ajustes u optimizaciones cuando formen parte del servicio contratado.',
          'Mantener confidencialidad sobre la información del cliente.',
          'Utilizar la información, accesos y materiales del cliente únicamente para fines relacionados con el servicio contratado.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>La obligación del prestador es una obligación de medios y no de resultados. Por lo tanto, el prestador se obliga a ejecutar el servicio de manera profesional, pero no garantiza resultados comerciales específicos.</p>

      {divider}

      <h2 style={h2Style}>IX. Obligaciones del cliente</h2>
      <p style={{ ...pStyle, marginBottom: 6 }}>El cliente se obliga a:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Proporcionar información clara, veraz, completa y oportuna.',
          'Entregar materiales, fotografías, videos, logotipos, textos, accesos, contraseñas, permisos o cualquier elemento necesario para ejecutar el servicio.',
          'Mantener comunicación activa y responder solicitudes del prestador en tiempo razonable.',
          'Cubrir oportunamente los pagos acordados.',
          'Cubrir directamente el presupuesto publicitario cuando aplique.',
          'No modificar, alterar, pausar, eliminar o interferir con campañas, páginas web, configuraciones o activos trabajados por el prestador sin previo aviso.',
          'Revisar y aprobar entregables dentro de los plazos acordados.',
          'Garantizar que cuenta con los derechos necesarios sobre logotipos, imágenes, textos, marcas, productos o materiales proporcionados.',
          'Cumplir con sus obligaciones fiscales, comerciales, laborales, sanitarias, administrativas y legales.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>El incumplimiento de cualquiera de estas obligaciones podrá afectar el desempeño del servicio y liberará al prestador de responsabilidad sobre retrasos, errores, resultados limitados o falta de cumplimiento atribuible al cliente.</p>

      {divider}

      <h2 style={h2Style}>X. Revisiones, cambios y entregables</h2>
      <p style={pStyle}>Los entregables, revisiones y modificaciones incluidas serán únicamente las expresamente indicadas en la cotización, contrato, propuesta o comunicación escrita correspondiente.</p>
      <p style={pStyle}>Las rondas de revisión deberán solicitarse de forma clara, agrupada y por escrito.</p>
      <p style={pStyle}>Los cambios adicionales, solicitudes fuera del alcance original, rediseños completos, nuevas campañas, nuevas secciones web, nuevas piezas, urgencias, modificaciones estructurales o trabajos no contemplados podrán cotizarse por separado.</p>
      <p style={pStyle}>El prestador no estará obligado a realizar trabajos adicionales sin pago o acuerdo previo por escrito.</p>

      {divider}

      <h2 style={h2Style}>XI. Suspensión del servicio</h2>
      <p style={{ ...pStyle, marginBottom: 6 }}>El prestador podrá suspender el servicio sin responsabilidad cuando:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'El cliente no entregue información, materiales o accesos necesarios.',
          'El cliente no realice el pago correspondiente.',
          'El cliente no cubra el presupuesto publicitario requerido.',
          'El cliente modifique campañas, activos o configuraciones sin autorización.',
          'El cliente incurra en conductas abusivas, amenazas, insultos, acoso o uso indebido de los canales de comunicación.',
          'El cliente solicite actividades ilegales, engañosas, fraudulentas o contrarias a políticas de plataformas digitales.',
          'Exista imposibilidad técnica, bloqueo de cuentas, rechazo de plataformas o restricciones ajenas al prestador.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>El tiempo de suspensión no generará reembolso, compensación ni ampliación automática del servicio, salvo acuerdo escrito en contrario.</p>

      {divider}

      <h2 style={h2Style}>XII. Limitación de resultados de marketing</h2>
      <p style={pStyle}>El cliente reconoce que los resultados de marketing digital dependen de múltiples variables externas que no pueden ser controladas ni garantizadas por el prestador, incluyendo:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Comportamiento del mercado.',
          'Demanda del producto o servicio.',
          'Competencia.',
          'Calidad, precio, reputación y posicionamiento del negocio del cliente.',
          'Presupuesto publicitario disponible.',
          'Capacidad operativa del cliente para atender prospectos o ventas.',
          'Creatividad, oferta, ubicación, tiempos de respuesta y atención comercial.',
          'Políticas, algoritmos y decisiones de plataformas digitales.',
          'Factores económicos, estacionales, sociales o comerciales.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>En consecuencia, el prestador no garantiza ventas, clientes, prospectos, mensajes, alcance, retorno sobre inversión, crecimiento, posicionamiento, conversiones ni resultados económicos específicos.</p>
      <p style={pStyle}>La ausencia de los resultados esperados por el cliente no constituirá incumplimiento del prestador, siempre que el servicio haya sido ejecutado conforme al alcance contratado.</p>

      {divider}

      <h2 style={h2Style}>XIII. Desarrollo de páginas web</h2>
      <p style={pStyle}>Cuando el servicio incluya diseño, desarrollo, rediseño o implementación de páginas web, el alcance será el indicado en la cotización o propuesta correspondiente.</p>
      <p style={{ ...pStyle, marginBottom: 6 }}>Salvo acuerdo distinto, el cliente será responsable de:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Proporcionar textos, fotografías, logotipo, información comercial y datos de contacto.',
          'Revisar y aprobar el contenido antes de su publicación.',
          'Cubrir costos de dominio, hosting, plugins, licencias, integraciones, plataformas, pasarelas de pago o servicios externos, cuando apliquen.',
          'Verificar que la información publicada sea correcta, legal y actualizada.',
          'Cumplir con las leyes aplicables a su actividad comercial.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>El prestador no será responsable por fallas de servicios externos, caídas de hosting, cambios de plataformas, errores de terceros, bloqueo de dominio, pérdida de accesos por causas ajenas o modificaciones hechas por el cliente o terceros.</p>

      {divider}

      <h2 style={h2Style}>XIV. Manejo de redes sociales</h2>
      <p style={pStyle}>Cuando el servicio incluya manejo de redes sociales, el alcance podrá contemplar planificación, diseño, redacción, publicación, programación, asesoría o administración de contenido, según lo contratado.</p>
      <p style={pStyle}>El cliente será responsable de la veracidad de la información publicada, la legalidad de sus productos o servicios y la atención directa a sus consumidores, salvo que se pacte expresamente otro alcance por escrito.</p>
      <p style={pStyle}>El prestador no será responsable por comentarios, quejas, reclamos, reseñas, denuncias, mensajes, bloqueos o reacciones de terceros frente al contenido publicado.</p>

      {divider}

      <h2 style={h2Style}>XV. Accesos a cuentas y activos digitales</h2>
      <p style={pStyle}>Cuando sea necesario, el cliente podrá otorgar accesos a cuentas publicitarias, redes sociales, administradores comerciales, hosting, dominio, páginas web, herramientas de analítica u otras plataformas.</p>
      <p style={pStyle}>El prestador utilizará dichos accesos únicamente para fines relacionados con el servicio contratado.</p>
      <p style={pStyle}>El cliente podrá revocar accesos al finalizar el servicio. El prestador también podrá retirar sus accesos una vez terminado el servicio o cuando lo considere necesario por seguridad, incumplimiento o finalización del proyecto.</p>

      {divider}

      <h2 style={h2Style}>XVI. Propiedad intelectual</h2>
      <p style={pStyle}>El prestador conservará la titularidad de metodologías, estrategias, estructuras, procesos, sistemas, propuestas, configuraciones, documentos, diseños base, conceptos, materiales creativos, código, plantillas, textos o elementos desarrollados con motivo del servicio, salvo que se pacte expresamente una cesión de derechos por escrito.</p>
      <p style={pStyle}>El cliente recibirá una licencia de uso no exclusiva, intransferible y sin derecho de sublicencia para utilizar los materiales entregados exclusivamente en la promoción de su propio negocio.</p>
      <p style={pStyle}>El cliente no podrá revender, sublicenciar, registrar, copiar, modificar, distribuir, entregar a terceros o explotar de forma distinta los materiales creados por el prestador sin autorización previa y por escrito, salvo que se haya pactado lo contrario.</p>
      <p style={pStyle}>Los logotipos, marcas, imágenes, productos, fotografías, nombres comerciales y materiales previamente proporcionados por el cliente seguirán siendo propiedad del cliente o de sus respectivos titulares.</p>

      {divider}

      <h2 style={h2Style}>XVII. Uso de trabajos en portafolio</h2>
      <p style={pStyle}>El prestador podrá utilizar piezas gráficas, páginas web, resultados generales, capturas, campañas, diseños o materiales desarrollados como parte de su portafolio profesional, redes sociales, sitio web o presentaciones comerciales.</p>
      <p style={pStyle}>No se divulgará información confidencial, datos económicos específicos, datos personales sensibles, accesos, contraseñas ni información marcada expresamente como confidencial por el cliente.</p>

      {divider}

      <h2 style={h2Style}>XVIII. Confidencialidad</h2>
      <p style={pStyle}>Ambas partes deberán mantener confidencialidad sobre información estratégica, comercial, técnica, publicitaria, financiera, operativa, creativa o de cualquier otra naturaleza a la que tengan acceso con motivo del servicio.</p>
      <p style={pStyle}>Esta obligación permanecerá vigente durante la relación comercial y posteriormente, salvo que la información sea pública, haya sido autorizada por escrito o deba revelarse por mandato legal.</p>

      {divider}

      <h2 style={h2Style}>XIX. Protección de datos personales</h2>
      <p style={pStyle}>Los datos personales serán tratados conforme al Aviso de Privacidad publicado en este sitio web y conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</p>
      <p style={pStyle}>El cliente acepta que sus datos sean utilizados para fines de contacto, contratación, prestación del servicio, seguimiento, facturación, soporte y cumplimiento de obligaciones legales o contractuales.</p>

      {divider}

      <h2 style={h2Style}>XX. Deslinde sobre el negocio del cliente</h2>
      <p style={{ ...pStyle, marginBottom: 6 }}>El prestador no será responsable por:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Calidad, entrega, legalidad, funcionamiento o cumplimiento de los productos o servicios del cliente.',
          'Ventas, ingresos, utilidades, crecimiento, pérdidas o resultados financieros del negocio del cliente.',
          'Atención a prospectos, clientes, mensajes, pedidos o reclamaciones.',
          'Cumplimiento fiscal, laboral, sanitario, comercial, administrativo o legal del cliente.',
          'Daños, perjuicios, quejas, denuncias o reclamaciones de terceros relacionadas con el negocio del cliente.',
          'Fallas, bloqueos, suspensiones, rechazos o cambios realizados por plataformas digitales externas.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>
      <p style={pStyle}>La responsabilidad máxima del prestador, bajo cualquier teoría legal, quedará limitada al monto de los honorarios efectivamente pagados por el cliente por el servicio específico que haya dado origen a la reclamación.</p>

      {divider}

      <h2 style={h2Style}>XXI. Fuerza mayor y caso fortuito</h2>
      <p style={pStyle}>Ninguna de las partes será responsable por incumplimientos derivados de eventos de fuerza mayor o caso fortuito, tales como desastres naturales, fallas generalizadas de internet, apagones, pandemias, actos de autoridad, bloqueos de plataformas, interrupciones masivas de servicios digitales, fallas de servidores, restricciones legales o cualquier evento imprevisible, irresistible y ajeno a la voluntad de las partes.</p>

      {divider}

      <h2 style={h2Style}>XXII. Comunicaciones</h2>
      <p style={pStyle}>Toda comunicación relacionada con los servicios podrá realizarse por correo electrónico, WhatsApp, llamada, redes sociales, formularios web o cualquier medio escrito utilizado por las partes.</p>
      <p style={pStyle}>Los acuerdos, cambios de alcance, autorizaciones, aprobaciones, solicitudes adicionales o modificaciones relevantes deberán constar por escrito para ser válidos.</p>

      {divider}

      <h2 style={h2Style}>XXIII. Modificaciones a los Términos y Condiciones</h2>
      <p style={pStyle}>El prestador podrá modificar los presentes Términos y Condiciones en cualquier momento para ajustarlos a cambios legales, comerciales, técnicos u operativos.</p>
      <p style={pStyle}>Las modificaciones serán publicadas en este sitio web con la fecha de última actualización.</p>

      {divider}

      <h2 style={h2Style}>XXIV. Legislación aplicable y jurisdicción</h2>
      <p style={pStyle}>Para la interpretación, cumplimiento y ejecución de los presentes Términos y Condiciones, las partes se someten a la legislación aplicable en los Estados Unidos Mexicanos y a la jurisdicción de los tribunales competentes de la ciudad de Chihuahua, Estado de Chihuahua, México, renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.</p>
    </>
  )
}

function Reembolsos() {
  return (
    <>
      <p style={pStyle}>
        La presente Política de Reembolsos forma parte de los Términos y Condiciones aplicables a los servicios ofrecidos por Daniel Quintana, incluyendo publicidad pagada en Meta Ads, manejo de redes sociales, diseño o desarrollo de páginas web, asesoría de marketing digital y servicios relacionados.
      </p>
      <p style={pStyle}>
        Antes de realizar cualquier pago, el cliente deberá leer y aceptar esta Política de Reembolsos.
      </p>

      {divider}

      <h2 style={h2Style}>I. Regla general de no reembolso</h2>
      <p style={pStyle}>Una vez iniciado el servicio, no procederá devolución total ni parcial de los honorarios pagados.</p>
      <p style={pStyle}>Esto aplica sin importar el avance del proyecto, campaña, diseño, página web, estrategia, asesoría, entregable o servicio contratado.</p>

      {divider}

      <h2 style={h2Style}>II. Cuándo se considera iniciado el servicio</h2>
      <p style={{ ...pStyle, marginBottom: 6 }}>Para efectos de esta política, se entenderá que el servicio ha iniciado cuando ocurra cualquiera de los siguientes supuestos:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'El prestador confirme la recepción del pago.',
          'El cliente proporcione información, accesos, materiales, brief, instrucciones o datos necesarios para comenzar.',
          'El prestador inicie actividades de planeación, análisis, investigación, estrategia, configuración, diseño, redacción, desarrollo, revisión o preparación del servicio.',
          'Se cree, configure, revise o trabaje sobre una campaña publicitaria, página web, diseño, pieza gráfica, contenido, documento, cuenta publicitaria, administrador comercial o activo digital.',
          'Se realice o agende una reunión, llamada, asesoría, revisión o sesión relacionada con el servicio.',
          'El prestador reserve tiempo operativo, creativo, estratégico o técnico para atender el proyecto del cliente.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>

      {divider}

      <h2 style={h2Style}>III. Justificación de la política</h2>
      <p style={pStyle}>El cliente reconoce que los servicios de marketing digital, publicidad, diseño, redes sociales y páginas web implican trabajo intelectual, creativo, estratégico, técnico y operativo desde el inicio.</p>
      <p style={pStyle}>Por esta razón, una vez iniciado el servicio, el pago realizado cubre tiempo profesional, disponibilidad, planeación, análisis, herramientas, experiencia, preparación y recursos destinados al proyecto.</p>

      {divider}

      <h2 style={h2Style}>IV. Resultados no garantizados</h2>
      <p style={pStyle}>La falta de ventas, prospectos, mensajes, alcance, retorno de inversión, crecimiento, conversiones o resultados comerciales esperados no dará derecho a reembolso.</p>
      <p style={pStyle}>El cliente reconoce que los resultados dependen de factores externos al prestador, tales como mercado, competencia, presupuesto publicitario, producto, precio, oferta, reputación, atención al cliente, tiempos de respuesta, políticas de plataformas digitales y condiciones comerciales del negocio.</p>
      <p style={pStyle}>El prestador ofrece servicios profesionales de medios y no de resultados.</p>

      {divider}

      <h2 style={h2Style}>V. Cancelación por parte del cliente</h2>
      <p style={pStyle}>El cliente podrá solicitar la cancelación del servicio en cualquier momento mediante aviso por escrito al correo: {emailLink('daniel.chquintana@gmail.com')}</p>
      <p style={pStyle}>Sin embargo, si el servicio ya fue iniciado, dicha cancelación no generará derecho a devolución total ni parcial de los honorarios pagados.</p>

      {divider}

      <h2 style={h2Style}>VI. Incumplimiento del cliente</h2>
      <p style={{ ...pStyle, marginBottom: 6 }}>No habrá reembolso cuando el servicio no pueda ejecutarse, se retrase o se vea afectado por causas atribuibles al cliente, incluyendo:</p>
      <ol style={{ margin: '0 0 14px', paddingLeft: 22 }}>
        {[
          'Falta de entrega de información, accesos o materiales.',
          'Falta de respuesta o comunicación oportuna.',
          'Entrega de información incompleta, incorrecta o falsa.',
          'Falta de pago del presupuesto publicitario.',
          'Modificación de campañas, páginas, cuentas o activos sin autorización.',
          'Revocación de accesos necesarios para ejecutar el servicio.',
          'Cambios constantes de instrucciones o alcance.',
          'Solicitudes fuera del servicio contratado.',
          'Incumplimiento de políticas de plataformas digitales.',
          'Uso de productos, servicios, imágenes, marcas o contenidos sin derechos suficientes.',
        ].map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
      </ol>

      {divider}

      <h2 style={h2Style}>VII. Presupuesto publicitario</h2>
      <p style={pStyle}>El presupuesto destinado a publicidad en plataformas como Meta Ads, Facebook, Instagram, Google u otras plataformas digitales es independiente de los honorarios del prestador.</p>
      <p style={pStyle}>Dicho presupuesto se paga directamente a las plataformas correspondientes y está sujeto a las políticas, cargos, consumos, revisiones y condiciones de dichas plataformas.</p>
      <p style={pStyle}>El prestador no será responsable por reembolsos, cargos, consumos, saldos, bloqueos, rechazos o cobros realizados por plataformas externas.</p>

      {divider}

      <h2 style={h2Style}>VIII. Casos excepcionales</h2>
      <p style={pStyle}>El prestador podrá analizar, de forma libre y discrecional, algún ajuste, compensación parcial, crédito o alternativa comercial únicamente cuando lo considere procedente y siempre que exista causa justificada.</p>
      <p style={pStyle}>Cualquier excepción deberá constar por escrito. La revisión de un caso no implica obligación de reembolso.</p>

      {divider}

      <h2 style={h2Style}>IX. Aceptación</h2>
      <p style={pStyle}>Al realizar un pago, contratar un servicio o aceptar una cotización, el cliente declara haber leído, entendido y aceptado la presente Política de Reembolsos.</p>
      <p style={{ ...pStyle, marginBottom: 6 }}>Para dudas relacionadas con esta política, el cliente podrá comunicarse a:</p>
      <ul style={{ margin: '0 0 14px', paddingLeft: 20 }}>
        <li style={liStyle}>Correo electrónico: {emailLink('daniel.chquintana@gmail.com')}</li>
        <li style={liStyle}>Teléfono / WhatsApp: +52 614 304 1750</li>
        <li style={liStyle}>Ubicación: Chihuahua, Chihuahua, México</li>
      </ul>
    </>
  )
}

// ── Mapa de páginas ────────────────────────────────────────────
const PAGES: Record<string, { title: string; date: string; content: React.ReactNode }> = {
  privacidad: {
    title: 'Aviso de Privacidad',
    date:  '24 de mayo de 2026',
    content: <Privacidad />,
  },
  cookies: {
    title:   'Política de Cookies',
    date:    '24 de mayo de 2026',
    content: <Cookies />,
  },
  reembolsos: {
    title:   'Política de Reembolsos',
    date:    '24 de mayo de 2026',
    content: <Reembolsos />,
  },
  terminos: {
    title:   'Términos y Condiciones',
    date:    '24 de mayo de 2026',
    content: <Terminos />,
  },
}

// ── Página ─────────────────────────────────────────────────────
export function LegalPage() {
  const { slug } = useParams<{ slug: string }>()
  const page = slug ? PAGES[slug] : null

  return (
    <div style={{
      minHeight: '100vh', background: '#000', color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
      padding: '60px 24px 100px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Back */}
        <Link to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', marginBottom: 40, transition: 'color .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.3)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver al inicio
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,159,10,0.7)', marginBottom: 10 }}>
            Información legal
          </p>
          <h1 style={{ fontSize: 'clamp(26px,6vw,38px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
            {page ? page.title : 'Página no encontrada'}
          </h1>
          {page && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>
              Última actualización: {page.date}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 40 }} />

        {/* Content */}
        {page ? page.content : (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
            Esta página no existe.{' '}
            <Link to="/" style={{ color: 'rgba(255,159,10,0.8)', textDecoration: 'none' }}>Volver al inicio →</Link>
          </p>
        )}

      </div>
    </div>
  )
}
