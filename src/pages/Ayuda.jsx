export default function Ayuda() {
  const Q = ({ q, children }) => (
    <div className="py-3 border-b border-rule-soft">
      <h4 className="font-serif font-semibold text-[14px] text-ink mb-1">{q}</h4>
      <div className="text-[13px] text-ink-soft leading-relaxed">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-[22px] mb-1">Ayuda</h2>
        <p className="text-ink-faint text-[13px]">
          Guía breve para usar el Control de Vacaciones de Bloobit México.
        </p>
      </div>

      <section className="bg-paper border border-rule p-5">
        <h3 className="font-serif font-semibold text-[16px] mb-2">¿Cómo se calculan los días?</h3>
        <p className="text-[13px] text-ink-soft mb-3">
          El sistema aplica la Ley Federal del Trabajo (Art. 76, reforma 2022) usando la
          misma lógica que CONTPAQi Nóminas, que es la fuente oficial del kárdex.
        </p>
        <ul className="list-disc pl-5 text-[13px] text-ink-soft space-y-1.5">
          <li>Cada aniversario laboral se acumulan los días LFT correspondientes a ese año.</li>
          <li>Durante el año aniversario en curso, los días se devengan día a día (prorrateo).</li>
          <li>Las vacaciones tomadas se restan al momento en que se capturan.</li>
        </ul>
      </section>

      <section className="bg-paper border border-rule p-5">
        <h3 className="font-serif font-semibold text-[16px] mb-3">Dos saldos</h3>
        <Q q="Saldo (Tomable)">
          Los días ya cerrados por aniversarios cumplidos menos todo lo tomado. Es lo que
          el colaborador <strong>puede tomar hoy</strong> sin "pedir prestado" del año en curso.
        </Q>
        <Q q="Saldo total">
          El saldo total considerando lo que se devengará durante el año aniversario en
          curso. Es el que muestra CONTPAQi al cerrar el año. Puede incluir días que todavía
          no se devengan en su totalidad.
        </Q>
      </section>

      <section className="bg-paper border border-rule p-5">
        <h3 className="font-serif font-semibold text-[16px] mb-3">Flujo diario</h3>
        <Q q="Registrar vacaciones">
          Desde <strong>Padrón</strong> o <strong>Historial</strong>, usa el botón{' '}
          <em>+ Registrar vacaciones</em> / <em>+ Nuevo registro</em>. Elige al colaborador,
          las fechas y los días hábiles. El sistema calcula los días laborables automáticamente
          (puedes ajustarlos). Si se intenta registrar más días de los que el colaborador tiene
          disponibles, aparece una advertencia.
        </Q>
        <Q q="Ver kárdex de un colaborador">
          Haz clic sobre su fila en el Padrón, o entra a <strong>Kardex Individual</strong>{' '}
          y escoge su nombre.
        </Q>
        <Q q="Imprimir o guardar el kárdex en PDF">
          Dentro del Kardex Individual, usa el botón <em>Imprimir / Guardar PDF</em>, o la
          combinación <strong>Ctrl + P</strong> (⌘ + P en Mac). El sistema oculta la navegación
          y entrega solo el documento, en tamaño carta.
        </Q>
        <Q q="Cambiar la fecha de corte">
          Arriba a la derecha, al lado del cambio de tema. La fecha de corte afecta todos los
          cálculos y es compartida (todos los usuarios ven la misma).
        </Q>
      </section>

      <section className="bg-paper border border-rule p-5">
        <h3 className="font-serif font-semibold text-[16px] mb-3">Reportes</h3>
        <Q q="¿Qué reportes puedo generar?">
          Saldos al día de corte, vacaciones por rango de fechas, totales por colaborador,
          totales por mes y prima vacacional. Todos se pueden imprimir o exportar como CSV
          para abrir en Excel.
        </Q>
      </section>

      <section className="bg-paper border border-rule p-5">
        <h3 className="font-serif font-semibold text-[16px] mb-3">Soporte</h3>
        <p className="text-[13px] text-ink-soft">
          Para dudas técnicas o solicitar cambios, contacta a Carlos Beltrán (IT).
        </p>
      </section>
    </div>
  );
}
