const getTurnstileSiteKey = () => import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
const getApiUrl = () => import.meta.env.PUBLIC_API_URL || "http://localhost:8080";

interface Question {
  id: string;
  text: string;
  pilar: string;
}

interface DiagnosticoResultado {
  score: number;
  level: string;
  name: string;
  description: string;
  recommendations: string[];
  email: string;
}

const QUESTIONS: Question[] = [
  // 1. Cultura y Organización
  { id: "q1", text: "¿Dedicas (o tu equipo dedica) tiempo formal cada semana a aprender y experimentar con nuevas herramientas digitales?", pilar: "Cultura y Organización" },
  { id: "q2", text: "¿Tienes un plan o disposición clara para capacitar al equipo en nuevas competencias tecnológicas de forma regular?", pilar: "Cultura y Organización" },
  { id: "q3", text: "¿Promueves activamente la adopción de nuevas tecnologías y estas abierto/a a abandonar procesos antiguos?", pilar: "Cultura y Organización" },
  
  // 2. Estrategia
  { id: "q4", text: "¿Tienes una visión escrita de los objetivos digitales que quieres alcanzar en los próximos 12 meses?", pilar: "Estrategia" },
  { id: "q5", text: "¿Cuentas con un presupuesto mensual asignado exclusivamente para software o servicios digitales?", pilar: "Estrategia" },
  { id: "q6", text: "¿Colaboras activamente con socios tecnológicos, proveedores digitales o utilizas plataformas externas para innovar y fortalecer tu oferta de valor?", pilar: "Estrategia" },

  // 3. Operaciones y Procesos
  { id: "q7", text: "¿Tus procesos (de venta, entrega, post venta, etc.) están documentados paso a paso, aunque sea en papel?", pilar: "Operaciones y Procesos" },
  { id: "q8", text: "¿Has identificado claramente las 3 tareas manuales que más tiempo consumen a la semana?", pilar: "Operaciones y Procesos" },
  { id: "q9", text: "¿Todo tu equipo utiliza las mismas herramientas oficiales del negocio, evitando el uso de cuadernos personales o chats informales?", pilar: "Operaciones y Procesos" },
  
  // 4. Datos y Analítica
  { id: "q10", text: "¿Toda la información de tus clientes vive en una base de datos centralizada y digital en lugar de agendas o WhatsApp?", pilar: "Datos y Analítica" },
  { id: "q11", text: "¿Revisas al menos una vez al mes indicadores clave de rendimiento (KPIs) para decidir el rumbo de tu empresa o proyecto?", pilar: "Datos y Analítica" },
  { id: "q12", text: "¿Puedes conocer el margen de utilidad y los costos de tu operación de forma digital y actualizada en tiempo real?", pilar: "Datos y Analítica" },

  // 5. Tecnología
  { id: "q13", text: "¿Eres el dueño absoluto de tus dominios, correos corporativos y accesos de todas tus plataformas?", pilar: "Tecnología" },
  { id: "q14", text: "¿Tus herramientas digitales están conectadas entre sí (ej: el sitio web envía datos al CRM) sin intervención humana?", pilar: "Tecnología" },
  { id: "q15", text: "¿Usas gestores de contraseñas y cuentas con respaldos automáticos en la nube de toda tu información crítica?", pilar: "Tecnología" }
];

const LEVELS = {
  INI: { name: "Nivel SEMILLA", icon: "eco", description: "El negocio está en una etapa puramente analógica. La información es vulnerable y depende de tu memoria o presencia física. Prioridad: Ordenar procesos básicos y migrar la información crítica a la nube. <br><br><strong>Regla de Oro:</strong> No intentes pasar de Semilla a Planta en una semana. Enfócate en convertir un \"No\" en un \"Sí\" cada mes." },
  INT: { name: "Nivel BROTE", icon: "rocket_launch", description: "Ya existe una base tecnológica, pero hay \"islas de información\". El equipo usa herramientas, pero de forma aislada y con mucha duplicidad. Prioridad: Integrar herramientas y capacitar al equipo en una cultura digital compartida. <br><br><strong>Regla de Oro:</strong> No intentes pasar de Semilla a Planta en una semana. Enfócate en convertir un \"No\" en un \"Sí\" cada mes." },
  ADV: { name: "Nivel PLANTA", icon: "diamond", description: "Tu negocio tiene raíces digitales sólidas. El sistema trabaja para ti, permitiéndote escalar y tomar decisiones basadas en datos. Prioridad: Optimización avanzada con Inteligencia Artificial y búsqueda de máxima eficiencia operativa. <br><br><strong>Regla de Oro:</strong> No intentes pasar de Semilla a Planta en una semana. Enfócate en convertir un \"No\" en un \"Sí\" cada mes." }
};

const PILAR_ICONS: Record<string, string> = {
  "Cultura y Organización": "groups",
  "Estrategia": "explore",
  "Operaciones y Procesos": "settings",
  "Datos y Analítica": "bar_chart",
  "Tecnología": "computer"
};

class DiagnosticoForm extends HTMLElement {
  private step: "intro" | "quiz" | "contact" | "result" = "intro";
  private currentPilarIndex = 0;
  private answers: Record<string, boolean> = {};
  private pilars = ["Cultura y Organización", "Estrategia", "Operaciones y Procesos", "Datos y Analítica", "Tecnología"]
  private loading = false;
  private result: DiagnosticoResultado | null = null;
  private turnstileWidgetId: string | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  private nextStep() {
    if (this.step === "intro") {
      this.step = "quiz";
      // Disparamos evento para que el padre oculte el header
      this.dispatchEvent(new CustomEvent('diagnostico-start', {
        bubbles: true,
        composed: true
      }));
    } else if (this.step === "quiz") {
      if (this.currentPilarIndex < this.pilars.length - 1) {
        this.currentPilarIndex++;
      } else {
        this.step = "contact";
      }
    }
    this.render();
    this.scrollToTop();
  }

  private prevStep() {
    if (this.step === "quiz") {
      if (this.currentPilarIndex > 0) {
        this.currentPilarIndex--;
      } else {
        this.step = "intro";
      }
    } else if (this.step === "contact") {
      this.step = "quiz";
      this.currentPilarIndex = this.pilars.length - 1;
    }
    this.render();
    this.scrollToTop();
  }

  private handleAnswer(questionId: string, value: boolean) {
    this.answers[questionId] = value;
    this.render();
  }

  private async handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (this.loading) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Capturamos el token de Turnstile de forma robusta
    const turnstileToken = formData.get("cf-turnstile-response")?.toString() || 
                          (form.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement)?.value;

    if (!turnstileToken) {
        alert("Por favor, completa el captcha de seguridad para continuar.");
        return;
    }

    // Convertimos las respuestas de objeto a arreglo ordenado para la API
    const answersArray = QUESTIONS.map(q => !!this.answers[q.id]);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      industry: formData.get("sector"), // Mapear 'sector' a 'industry' según DTO
      answers: answersArray,           // Enviar como arreglo de booleanos
      turnstileToken: turnstileToken
    };

    this.loading = true;
    this.render();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

    try {
      const response = await fetch(`${getApiUrl()}/diagnostico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Error al procesar el diagnóstico");
      }
      
      this.result = await response.json();
      this.step = "result";
      
      // Emitir evento para lanzar confeti y modal en Astro
      this.dispatchEvent(new CustomEvent('diagnostico-success', { bubbles: true, composed: true }));
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Submission error:", error);
      
      const isTimeout = error.name === 'AbortError';
      const message = isTimeout 
        ? "La solicitud está tardando demasiado debido a la generación del PDF. No te preocupes, es probable que el correo llegue en unos instantes."
        : (error.message || "Hubo un error al procesar tu diagnóstico. Por favor intenta de nuevo.");

      if ((window as any).modalHelpers) {
        (window as any).modalHelpers.updateModalMessage('diagnostic-error-modal', message);
        (window as any).modalHelpers.openModal('diagnostic-error-modal');
      } else {
        alert(message);
      }
    } finally {
      this.loading = false;
      this.render();
    }
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private render() {
    this.innerHTML = "";
    const container = document.createElement("div");
    container.className = "aform aform--card";

    switch (this.step) {
      case "intro":
        container.innerHTML = this.renderIntro();
        break;
      case "quiz":
        container.innerHTML = this.renderQuiz();
        break;
      case "contact":
        container.innerHTML = this.renderContact();
        break;
      case "result":
        container.innerHTML = this.renderResult();
        break;
    }

    this.appendChild(container);
    this.attachEvents();
    
    // Iniciar captcha después de añadir al DOM si estamos en el paso de contacto
    if (this.step === "contact") {
      this.initTurnstile();
    }
  }

  private renderIntro() {
    return `
      <div class="aform__intro-content">
        <div class="aform__hero-badge">
          <span class="aform__badge-dot"></span>
          Versión 2026
        </div>
        
        <h3 class="aform__title-small">Diagnóstico de Madurez Digital</h3>
        
        <p class="aform__subtitle">
          Analiza 15 puntos clave y recibe una hoja de ruta estratégica para digitalizar tu empresa.
        </p>

        <section class="aform__instructions">
          <div class="aform__instructions-quote">
            <p>Esta autoevaluación te permitirá entender el nivel real de digitalización de tu negocio.</p>
            
            <p>Debes responder cada pregunta con <strong>"Sí"</strong> solo si puedes demostrarlo con evidencia concreta (documento, planilla, sistema, procedimiento escrito).</p>
            
            <p>Si algo lo haces de manera informal, de memoria o sin respaldo, debes responder <strong>"No"</strong>.</p>
          </div>

          <div class="aform__rules">
            <h4>Reglas de respuesta:</h4>
            <ul class="aform__rules-ul">
              <li>Cada "Sí" equivale a 1 punto</li>
              <li>Cada "No" equivale a 0 puntos</li>
              <li>No existen respuestas correctas o incorrectas, solo respuestas honestas</li>
              <li>La evaluación debe reflejar la realidad actual, no intenciones futuras.</li>
            </ul>
          </div>
        </section>

        <div class="aform__btn-container-right">
          <button class="btn-cta aform__btn-start" id="btn-start">
            Comenzar Diagnóstico Gratis
          </button>
        </div>
      </div>
    `;
  }

  private renderQuiz() {
    const pilar = this.pilars[this.currentPilarIndex];
    const questions = QUESTIONS.filter(q => q.pilar === pilar);
    const totalAnswered = Object.keys(this.answers).length;
    const progress = Math.round((totalAnswered / QUESTIONS.length) * 100);

    return `
      <div class="aform__pilar-header">
        <div class="aform__pilar-icon"><span class="material-symbols-outlined">${PILAR_ICONS[pilar]}</span></div>
        <div class="aform__pilar-info">
          <div class="aform__pilar-sup">${pilar}</div>
          <h3 class="aform__title">${this.getPilarTitle(pilar)}</h3>
          <p class="aform__pilar-subtitle"><em>"${this.getPilarSubtitle(pilar)}"</em></p>
        </div>
      </div>

      <div class="aform__progress-header-bar">
        <div class="aform__progress-bar-container">
          <div class="aform__progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="aform__progress-label">Progreso del Diagnóstico — ${progress}% completado</div>
      </div>

      <div class="aform__questions">
        ${questions.map((q, idx) => {
          const absoluteIdx = QUESTIONS.indexOf(q) + 1;
          const answered = this.answers[q.id] !== undefined;
          return `
            <div class="aform__question ${answered ? 'aform__question--answered' : ''}">
              <p class="aform__question-text">
                <span class="aform__question-num">${absoluteIdx}</span>
                ${q.text}
              </p>
              <div class="aform__yn-group">
                <button type="button" class="aform__yn ${this.answers[q.id] === true ? 'aform__yn--yes-active' : ''}" data-qid="${q.id}" data-val="true">
                  <span class="material-symbols-outlined">check_circle</span>
                  Sí
                </button>
                <button type="button" class="aform__yn ${this.answers[q.id] === false ? 'aform__yn--no-active' : ''}" data-qid="${q.id}" data-val="false">
                  <span class="material-symbols-outlined">cancel</span>
                  No
                </button>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="aform__nav">
        <button class="btn-cta__border" id="btn-prev">
          <span class="material-symbols-outlined" style="color: white">arrow_back</span>
          Anterior
        </button>
        <button class="btn-cta ${this.isPilarComplete(pilar) ? '' : 'btn--disabled'}" id="btn-next" ${this.isPilarComplete(pilar) ? "" : "disabled"}>
          ${this.currentPilarIndex === this.pilars.length - 1 ? "Ver Resultados" : "Continuar"}
          <span class="material-symbols-outlined" style="color: white">arrow_forward</span>
        </button>
      </div>
    `;
  }

  private renderContact() {
    const score = Object.values(this.answers).filter(v => v).length;
    return `
      <div class="aform__contact-grid">
        <div class="aform__contact-info">
          <div class="aform__contact-score">
            <span class="aform__contact-score-num">${score}/15</span>
            <span class="aform__contact-score-label">Puntos de Madurez</span>
          </div>
          <h3 class="aform__title"><span class="material-symbols-outlined">celebration</span> Tus resultados están listos</h3>
          <p class="aform__subtitle">
            Ingresa tus datos para recibir el reporte estratégico en PDF directamente en tu bandeja de entrada.
          </p>
        </div>

        <div class="aform__progress-header-bar" style="grid-column: 1 / -1; margin-top: var(--space-lg);">
          <div class="aform__progress-bar-container">
            <div class="aform__progress-bar" style="width: 100%"></div>
          </div>
          <div class="aform__progress-label">Fase final — 100% completado</div>
        </div>

        <form class="aform__contact-form" id="contact-form">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input type="text" name="name" class="form-input" placeholder="Nombre completo" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">Correo electrónico</label>
            <input type="email" name="email" class="form-input" placeholder="tucorreo@ejemplo.com" required />
          </div>

          <div class="form-group">
            <label class="form-label">Empresa</label>
            <input type="text" name="company" class="form-input" placeholder="nombre de la empresa" required />
          </div>

          <div class="form-group">
            <label class="form-label">Sector industrial</label>
            <div class="select-wrapper">
              <select name="sector" class="form-select" required>
                <option value="" disabled selected>Selecciona un sector industrial</option>
                <option value="Comercio">Comercio</option>
                <option value="Servicios Profesionales">Servicios Profesionales</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Construcción e Inmobiliario">Construcción e Inmobiliario</option>
                <option value="Manufactura y Producción">Manufactura y Producción</option>
                <option value="Agricultura y Agroindustria">Agricultura y Agroindustria</option>
                <option value="Transporte y Logística">Transporte y Logística</option>
                <option value="Belleza y Bienestar">Belleza y Bienestar</option>
                <option value="Legal y Contable">Legal y Contable</option>
                <option value="Creativo y Marketing">Creativo y Marketing</option>
                <option value="Turismo y Hospedaje">Turismo y Hospedaje</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          <div id="turnstile-container" class="aform__turnstile"></div>

          <div class="aform__nav">
            <button type="button" class="btn-cta__border" id="btn-prev">
              <span class="material-symbols-outlined" style="color: white">arrow_back</span>
              Anterior
            </button>
            <button type="submit" class="btn-cta ${this.loading ? 'btn-loading' : ''}" ${this.loading ? "disabled" : ""}>
              ${this.loading ? "Procesando diagnóstico..." : "Finalizar Diagnóstico"}
              ${this.loading ? "" : '<span class="material-symbols-outlined" style="color: white">arrow_forward</span>'}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  private renderResult() {
    return `
      <div class="aform__success">
        <div class="aform__success-icon">
          <span class="material-symbols-outlined">verified</span>
        </div>

        <h2 class="aform__success-title">¡Diagnóstico Completado!</h2>
        
        <div class="aform__result-badge">
          <span class="icon-container"><span class="material-symbols-outlined">${this.result?.level === 'semilla' ? 'eco' : this.result?.level === 'brote' ? 'rocket_launch' : 'diamond'}</span></span>
          <span class="label">Nivel ${this.result?.level.toUpperCase()}</span>
        </div>

        <p class="aform__success-subtitle" style="max-width: 600px; font-style: italic; color: var(--color-text);">
          "${this.result?.description}"
        </p>

        <p class="aform__success-subtitle">
          Hemos enviado el reporte estratégico completo a <strong>${this.result?.email || 'tu correo'}</strong>:
        </p>

        <ul class="aform__success-list">
          <li>
            <span class="material-symbols-outlined">description</span>
            Tu diagnóstico digital completo
          </li>
          <li>
            <span class="material-symbols-outlined">map</span>
            La hoja de ruta estratégica para avanzar en la digitalización de tu empresa
          </li>
        </ul>

        <div class="aform__success-notice">
          <span class="material-symbols-outlined">inbox</span>
          Revisa tu bandeja de entrada — y también la carpeta de spam por si acaso.
        </div>

        <div class="aform__success-cta">
          <p>¿Quieres acelerar tu transformación digital con ayuda experta?</p>
          <a
            href="https://calendly.com/gabrielzavando/30min"
            target="_blank"
            class="btn-cta"
          >
            <span class="material-symbols-outlined" style="color: white">calendar_month</span>
            Agenda una sesión estratégica gratis
          </a>
        </div>
      </div>
    `;
  }

  private getPilarTitle(pilar: string) {
    const titles: Record<string, string> = {
      "Cultura y Organización": "Cultura y Organización (Habilidades y Liderazgo)",
      "Estrategia": "Estrategia (La Brújula)",
      "Operaciones y Procesos": "Operaciones y Procesos (El Motor)",
      "Datos y Analítica": "Datos y Analítica (La Inteligencia)",
      "Tecnología": "Tecnología (Las Herramientas)"
    };
    return titles[pilar] || pilar;
  }

  private getPilarSubtitle(pilar: string) {
    const subtitles: Record<string, string> = {
      "Cultura y Organización": "El éxito digital depende de la mentalidad, no del código.",
      "Estrategia": "Digitalizar el caos solo genera un caos más rápido.",
      "Operaciones y Procesos": "Eficiencia es hacer las cosas bien; efectividad es hacer las cosas correctas.",
      "Datos y Analítica": "Lo que no se mide, no se puede mejorar.",
      "Tecnología": "El software debe adaptarse a las personas, no las personas al software."
    };
    return subtitles[pilar] || "";
  }

  private isPilarComplete(pilar: string) {
    const questions = QUESTIONS.filter(q => q.pilar === pilar);
    return questions.every(q => this.answers[q.id] !== undefined);
  }

  private attachEvents() {
    const btnStart = this.querySelector("#btn-start");
    if (btnStart) btnStart.addEventListener("click", () => this.nextStep());

    const btnNext = this.querySelector("#btn-next");
    if (btnNext) btnNext.addEventListener("click", () => this.nextStep());

    const btnPrev = this.querySelector("#btn-prev");
    if (btnPrev) btnPrev.addEventListener("click", () => this.prevStep());

    const ynButtons = this.querySelectorAll(".aform__yn");
    ynButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const qid = target.dataset.qid!;
        const val = target.dataset.val === "true";
        this.handleAnswer(qid, val);
      });
    });

    const form = this.querySelector("#contact-form");
    if (form) form.addEventListener("submit", (e) => this.handleSubmit(e as SubmitEvent));
  }

  private initTurnstile() {
    const container = this.querySelector("#turnstile-container") as HTMLElement;
    if (!container) return;

    if ((window as any).turnstile) {
        // Limpiamos cualquier widget previo
        if (this.turnstileWidgetId) {
            try {
                (window as any).turnstile.remove(this.turnstileWidgetId);
            } catch (e) {}
        }

        const siteKey = getTurnstileSiteKey();
        if (!siteKey) {
            console.error("Turnstile Site Key missing");
            container.innerHTML = "<p style='color:red;font-size:12px'>Error de configuración: Captcha deshabilitado</p>";
            return;
        }

        this.turnstileWidgetId = (window as any).turnstile.render(container, {
            sitekey: siteKey,
            theme: 'dark',
            callback: (token: string) => {
                console.log(`Captcha validado`);
            },
            "error-callback": (err: any) => {
              console.error("Turnstile Error:", err);
            }
        });
    } else {
        setTimeout(() => this.initTurnstile(), 500);
    }
  }
}

customElements.define("diagnostico-form", DiagnosticoForm);
