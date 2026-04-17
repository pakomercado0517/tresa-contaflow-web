export function PrivacyPageContent() {
  return (
    <article className="text-foreground space-y-10">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
          Contafy · Documento informativo
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Aviso de privacidad integral y uso de cookies
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Última actualización: abril de 2026. Este texto describe cómo Contafy (en adelante, la
          &quot;Plataforma&quot;) trata los datos personales y el uso de tecnologías similares,
          conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
          Particulares (LFPDPPP) y demás normativa aplicable en los Estados Unidos Mexicanos. Debes
          revisarlo con asesoría legal para adaptarlo a tu operación (razón social, domicilio,
          medios de contacto y encargado).
        </p>
      </header>

      <section className="space-y-4" aria-labelledby="sec-responsable">
        <h2 id="sec-responsable" className="text-xl font-semibold">
          1. Responsable del tratamiento
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Indica aquí la persona moral o física responsable y su domicilio. Para ejercer derechos
          ARCO y atención de privacidad, contáctanos en{' '}
          <a
            href="mailto:admin@contafy.com.mx"
            className="text-foreground font-medium underline underline-offset-4 hover:opacity-90"
          >
            admin@contafy.com.mx
          </a>
          .
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="sec-datos">
        <h2 id="sec-datos" className="text-xl font-semibold">
          2. Datos personales que podemos tratar
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          De acuerdo con el alcance funcional del producto descrito en la documentación del
          producto (control de facturas CFDI, perfiles por RFC, reportes y suscripción SaaS), la
          Plataforma puede tratar, entre otros:
        </p>
        <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm leading-relaxed">
          <li>
            <span className="text-foreground font-medium">Identificación y cuenta:</span> nombre,
            correo electrónico, contraseña (almacenada de forma segura en el backend; no en texto
            plano en el navegador), estado de verificación de correo.
          </li>
          <li>
            <span className="text-foreground font-medium">Perfiles fiscales:</span> nombre o
            denominación del perfil, RFC, tipo de persona y datos necesarios para operar el
            servicio multi-RFC.
          </li>
          <li>
            <span className="text-foreground font-medium">Datos fiscales y operativos:</span>{' '}
            información derivada de facturas y gastos (XML y metadatos), totales, fechas, RFC de
            emisor/receptor, conceptos y demás campos necesarios para reportes y validaciones.
          </li>
          <li>
            <span className="text-foreground font-medium">Facturación y suscripción:</span>{' '}
            identificadores de cliente y suscripción en la pasarela de pagos (por ejemplo Stripe),
            plan contratado, estado de la suscripción e historial de eventos de pago según se
            registren en el sistema.
          </li>
          <li>
            <span className="text-foreground font-medium">Comunicaciones:</span> envío de correos
            transaccionales (verificación de cuenta, recuperación de contraseña, notificaciones
            relacionadas con el servicio) mediante proveedor de email (según configuración del
            producto, p. ej. Brevo).
          </li>
        </ul>
      </section>

      <section className="space-y-4" aria-labelledby="sec-fines">
        <h2 id="sec-fines" className="text-xl font-semibold">
          3. Finalidades del tratamiento
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Tratamos los datos personales para: (a) crear y administrar tu cuenta; (b) autenticarte y
          autorizar el acceso a la información; (c) operar la funcionalidad multi-perfil y asociar
          CFDI a los RFC configurados; (d) generar reportes y exportaciones que habilite tu plan; (e)
          gestionar suscripciones, cobros y cambios de plan; (f) cumplir obligaciones legales
          aplicables; (g) atender solicitudes de derechos ARCO y requerimientos de autoridad; (h)
          mejorar la seguridad, el rendimiento y la experiencia de uso de la Plataforma.
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="sec-transferencias">
        <h2 id="sec-transferencias" className="text-xl font-semibold">
          4. Encargados y transferencias
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Para operar el servicio, puede ser necesario que datos personales sean tratados por
          proveedores que actúan como encargados (por ejemplo: infraestructura en la nube, hosting
          del backend y base de datos, pasarela de pagos, proveedor de envío de correos). Estos
          tratamientos se realizan con contratos u obligaciones que limitan el uso de la
          información a lo necesario para el servicio. Las transferencias que requieran tu
          consentimiento se indicarán conforme a la ley.
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="sec-derechos">
        <h2 id="sec-derechos" className="text-xl font-semibold">
          5. Derechos ARCO y limitación del uso
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Puedes ejercer los derechos de acceso, rectificación, cancelación y oposición, así como
          revocar el consentimiento que hubiere sido otorgado, cuando proceda, enviando una
          solicitud al medio de contacto del responsable. La solicitud debe incluir identificación
          del titular y documentación que corresponda según la normativa vigente.
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="sec-conservacion">
        <h2 id="sec-conservacion" className="text-xl font-semibold">
          6. Conservación
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Conservamos los datos personales el tiempo necesario para cumplir las finalidades
          descritas y las obligaciones legales o contractuales. Los criterios de conservación
          pueden incluir el tipo de dato, la naturaleza de la relación con el usuario y
          requerimientos fiscales o de auditoría aplicables.
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="sec-seguridad">
        <h2 id="sec-seguridad" className="text-xl font-semibold">
          7. Medidas de seguridad
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          La arquitectura del producto contempla buenas prácticas como uso de HTTPS en producción,
          contraseñas con hash en el servidor, tokens de sesión con expiración controlada y
          controles de acceso en el backend. Ningún sistema es invulnerable; si detectas un
          incidente, notifícalo por el canal de soporte indicado por el responsable.
        </p>
      </section>

      <section className="space-y-4" id="cookies" aria-labelledby="sec-cookies">
        <h2 id="sec-cookies" className="text-xl font-semibold">
          8. Cookies y almacenamiento local
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          La Plataforma utiliza cookies <span className="text-foreground font-medium">httpOnly</span>{' '}
          gestionadas por el servidor de la aplicación Next.js para mantener tu sesión de forma
          segura: el backend emite tokens de acceso y renovación; el frontend los almacena en
          cookies para reducir el riesgo de exposición frente a ataques XSS frente al almacenamiento
          del token en JavaScript accesible.
        </p>

        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Finalidad
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Duración orientativa
                </th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground divide-y divide-border">
              <tr>
                <td className="text-foreground px-4 py-3 font-mono text-xs">accessToken</td>
                <td className="px-4 py-3">
                  Autenticación: permite asociar las peticiones al usuario autenticado.
                </td>
                <td className="px-4 py-3">Aprox. 15 minutos (renovable)</td>
              </tr>
              <tr>
                <td className="text-foreground px-4 py-3 font-mono text-xs">refreshToken</td>
                <td className="px-4 py-3">
                  Renovación de sesión: permite obtener un nuevo token de acceso sin volver a
                  iniciar sesión.
                </td>
                <td className="px-4 py-3">Aprox. 7 días (según configuración)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          Estas cookies se consideran necesarias para el funcionamiento del servicio contratado. Si
          en el futuro se incorporan cookies analíticas o de terceros no esenciales, se actualizará
          este aviso y, en su caso, se solicitará el consentimiento previo conforme a la normativa
          aplicable.
        </p>

        <p className="text-muted-foreground text-sm leading-relaxed">
          Además, el navegador puede usar{' '}
          <span className="text-foreground font-medium">almacenamiento local (localStorage)</span>{' '}
          para preferencias de interfaz que no sustituyen la autenticación (por ejemplo, estado de
          tours guiados o selección de perfil en el cliente), con el fin de mejorar la experiencia de
          uso.
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="sec-cambios">
        <h2 id="sec-cambios" className="text-xl font-semibold">
          9. Cambios a este aviso
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Podemos actualizar este documento para reflejar cambios en el servicio, en la normativa o
          en las prácticas de tratamiento. La fecha de &quot;última actualización&quot; se revisará
          en la parte superior. Cuando el cambio sea relevante, podremos notificarte por medios
          razonables (por ejemplo, correo electrónico o aviso en la Plataforma).
        </p>
      </section>

      <footer className="border-border text-muted-foreground border-t pt-8 text-xs leading-relaxed">
        <p>
          Este contenido es una plantilla alineada con la documentación interna del producto (PRD y
          arquitectura de autenticación). Debe completarse con datos del responsable, medios de
          contacto y cualquier cláusula adicional que indique tu asesor legal.
        </p>
      </footer>
    </article>
  );
}
