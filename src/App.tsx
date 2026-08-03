import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Megaphone,
  Code2,
  Send,
  Database,
  Linkedin,
  ArrowRight,
  Mail,
  GraduationCap,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import BlogPost from './components/BlogPost';
import Blog from './components/Blog';
import GoogleAdsChecklist from './components/GoogleAdsChecklist';
import FoundationalDocsTool from './components/FoundationalDocsTool';
import DropshippingMentoria from './components/DropshippingMentoria';
import { posts } from './data/posts';

const services = [
  {
    title: 'Data Science',
    icon: <Database className="w-8 h-8 text-star-light" />,
    tag: 'Data',
    description:
      'Análisis predictivo, Machine Learning y visualización de datos para impulsar decisiones basadas en datos.',
  },
  {
    title: 'Marketing Digital',
    icon: <Megaphone className="w-8 h-8 text-star-light" />,
    tag: 'Marketing',
    description:
      'Estrategias SEM, Social Media Marketing, Growth CRO y análisis de métricas para maximizar tu presencia digital.',
  },
  {
    title: 'Full Stack Development',
    icon: <Code2 className="w-8 h-8 text-star-light" />,
    tag: 'Code',
    description:
      'Desarrollo web end-to-end con las últimas tecnologías, integrando Web3 y blockchain para soluciones innovadoras y descentralizadas.',
  },
];

const experiences = [
  {
    company: 'IFMG',
    fullName: 'Interactive Financial Marketing Group',
    position: 'Paid Media & Data Analyst',
    period: '2026 — Actualidad',
    description:
      'Lidero la ejecución de TikTok Ads para tres cuentas del sector automotriz financiero en Estados Unidos y apoyo campañas de Meta y Microsoft Advertising, combinando optimización de campañas con analítica de datos para maximizar el retorno por lead.',
    logo: '/ifmg-logo.png',
  },
  {
    company: 'Smartmuscle Lab',
    fullName: 'Smartmuscle Lab',
    position: 'Coord. de Marketing Digital',
    period: '2025',
    description:
      'Lideré la creación del ecosistema digital de Smart Muscle: desarrollamos un e-commerce enfocado en conversión, activamos redes sociales con enfoque comercial, automatizamos procesos con IA y abrimos nuevos canales como marketplaces para diversificar ingresos.',
    logo: '/OIP.webp',
  },
  {
    company: 'Telefónica',
    fullName: 'Telefónica Hispam',
    position: 'Paid Media Specialist',
    period: '2022 — 2025',
    description:
      'Optimicé medios pagados en las operaciones de la región Hispanoamérica, maximizando ROI con modelos de atribución, automatización y audiencias first-party.',
    logo: '/Telefonica-Logo-500x281.png',
  },
  {
    company: 'UNICEF',
    fullName: 'UNICEF Colombia',
    position: 'Paid Media Specialist',
    period: '2020 — 2022',
    description:
      'Ejecuté la estrategia de adquisición de donantes por el canal digital, superando metas con CRO, A/B testing y segmentación data-driven.',
    logo: '/logo-UNICEF-500x281.png',
  },
  {
    company: 'Digital57',
    fullName: 'Digital57 — Digital Agency',
    position: 'Sr. Performance Strategist',
    period: '2019 — 2020',
    description:
      'Escalé campañas de performance para grandes marcas, optimizando CAC y ROAS con automatización y segmentación avanzada.',
    logo: null,
  },
  {
    company: 'Banco de Occidente',
    fullName: 'Banco de Occidente',
    position: 'CRO Growth Hacker',
    period: '2018 — 2019',
    description:
      'Mejoré la conversión en Occiauto Digital con Growth Hacking, A/B testing y optimización UX/UI, reduciendo drop-off y aumentando aprobaciones digitales del producto.',
    logo: '/Banco_de_Occidente_logo.png',
  },
  {
    company: 'Freelance',
    fullName: 'Freelance',
    position: 'Full Stack Digital Marketer',
    period: '2012 — Actualidad',
    description:
      'Fusiono Marketing, Data & Code para crear estrategias digitales integrales, optimizando adquisición, automatización y analítica avanzada.',
    logo: null,
  },
];

const teaching = [
  {
    name: 'Universidad Icesi',
    course: 'Manejo de Plataformas Digitales',
    city: 'Cali, Colombia',
    logo: '/logo-icesi.png',
  },
  {
    name: 'Universidad de San Buenaventura Cali',
    course: 'Visualización de Datos',
    city: 'Cali, Colombia',
    logo: '/logo-usb-cali.png',
  },
  {
    name: 'Partners Academy',
    course: 'Content Marketing · Diplomado en Marketing Digital',
    city: 'Virtual',
    logo: '/logo-partners-academy.png',
  },
];

const companies = [
  { name: 'Smartmuscle Lab', logo: '/OIP.webp' },
  { name: 'Telefonica Hispam', logo: '/Telefonica-Logo-500x281.png' },
  { name: 'UNICEF', logo: '/logo-UNICEF-500x281.png' },
  { name: 'Applebees', logo: '/applebees-png-logo-6501.png' },
  { name: 'CarSync', logo: '/logo_black.svg' },
  { name: 'Banco de Occidente', logo: '/Banco_de_Occidente_logo.png' },
  { name: 'El Bardo Bogotá', logo: '/el_bardo.webp' },
  { name: 'Learn English', logo: '/learn_english_international_logo.jpg' },
  { name: 'Tres Cuatro Cinco Bogotá', logo: '/tres_cuatro_cinco.webp' },
  { name: 'Tay Beach', logo: '/tay_beach.jpg' },
];

// Campo de estrellas animado (firma visual del sistema azul galaxia).
// Se reutiliza como el "bloque de foto" del hero, en vez de fotografía real.
const ROLES = [
  'Paid Media Strategist',
  'Media Buyer',
  'Google',
  'Meta',
  'TikTok',
  'SEM',
  'Data-Driven Growth',
  'eCommerce & Lead Gen',
];

// Barra de roles con scroll infinito, estilo nik.co, entre el hero y el
// tratamiento de nombre. Se duplica el contenido una vez para que el loop
// sea perfectamente continuo.
function RolesMarquee() {
  return (
    <div className="marquee border-y border-star-light/15 bg-space-900/60 py-4">
      <div className="marquee-track">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-center shrink-0">
            {ROLES.map((role, i) => (
              <span
                key={`${rep}-${i}`}
                className="label-mono !text-ice px-6 whitespace-nowrap flex items-center gap-6"
              >
                {role}
                <span className="text-star-light">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Barra de logos de marcas con scroll infinito, mismo patrón que RolesMarquee.
function LogosMarquee() {
  return (
    <div className="marquee">
      <div className="marquee-track marquee-track--slow">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-center gap-4 shrink-0 pr-4">
            {companies.map((company, index) => (
              <div
                key={`${rep}-${index}`}
                className="flex items-center justify-center p-6 bg-frost/95 border border-star-light/15 rounded-card h-24 w-40 shrink-0"
                title={company.name}
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className="max-h-12 max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: { x: number; y: number; r: number; a: number; da: number }[] = [];
    let raf = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const density = (canvas.width * canvas.height) / 9000;
      stars = Array.from({ length: Math.floor(density) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random(),
        da: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? -1 : 1),
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#7FA8FF';
      stars.forEach((s) => {
        s.a += s.da;
        if (s.a < 0 || s.a > 1) s.da *= -1;
        ctx.globalAlpha = Math.max(0, Math.min(1, s.a));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// Bloque "foto" plano: textura diagonal + ícono central, estilo bloques
// de imagen de nik.co, adaptado sin fotografía real.
function PhotoBlock({
  icon,
  className = '',
  label,
  children,
}: {
  icon?: React.ReactNode;
  className?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`photo-block ${className}`}>
      {children}
      {icon && <div className="opacity-70">{icon}</div>}
      {label && (
        <span className="absolute bottom-3 left-3 label-mono !text-star-light/70 !tracking-[0.2em]">
          {label}
        </span>
      )}
    </div>
  );
}

// Parallax sutil: la imagen se desplaza a menor velocidad que el scroll
// (efecto de profundidad clásico). Respeta prefers-reduced-motion. El
// "zoom" es el margen extra de escala que evita que se vean bordes vacíos
// al desplazar — fotos con poco margen alrededor del sujeto (ej. la luna)
// necesitan un zoom menor para no recortar el sujeto.
function useParallax(speed: number, zoom: number) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let ticking = false;
    const apply = () => {
      const rect = el.parentElement?.getBoundingClientRect();
      if (rect) {
        const raw = (window.innerHeight / 2 - rect.top) * speed;
        // El zoom solo da un margen extra de imagen (el "overscan"). El
        // desplazamiento nunca puede superar ese margen o se revela un
        // hueco/recorte en el borde — por eso se limita (clamp) aquí.
        const maxOffset = (rect.height * (zoom - 1)) / 2;
        const offset = Math.max(-maxOffset, Math.min(maxOffset, raw));
        el.style.transform = `translateY(${offset}px) scale(${zoom})`;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [speed, zoom]);

  return ref;
}

// Bloque de foto real (fotografías propias de Samuel), con un degradado
// azul encima para que armonicen con la paleta del sitio y un efecto
// parallax al hacer scroll.
function HeroPhoto({
  src,
  alt,
  className = '',
  parallaxSpeed = 0.1,
  zoom = 1.15,
}: {
  src: string;
  alt: string;
  className?: string;
  parallaxSpeed?: number;
  zoom?: number;
}) {
  const imgRef = useParallax(parallaxSpeed, zoom);

  return (
    <div className={`relative overflow-hidden rounded-card border border-star-light/15 ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
        loading="eager"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(4,8,23,.15) 0%, rgba(4,8,23,.05) 45%, rgba(4,8,23,.65) 100%), linear-gradient(120deg, rgba(62,123,255,.28), rgba(4,8,23,.1))',
        }}
      />
    </div>
  );
}

function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-space-950/80 border-b border-star-light/15">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          onClick={closeMobile}
          className="font-sans font-extrabold text-lg tracking-tight text-frost"
        >
          Samuel González
        </Link>

        {/* Nav de escritorio */}
        <nav className="hidden md:flex items-center gap-7">
          <a href="/#servicios" className="label-mono !text-muted hover:!text-frost transition-colors">
            Servicios
          </a>
          <a href="/#experiencia" className="label-mono !text-muted hover:!text-frost transition-colors">
            Experiencia
          </a>
          <Link to="/blog" className="label-mono !text-muted hover:!text-frost transition-colors">
            Blog
          </Link>
          <Link
            to="/mentoria-dropshipping"
            className="label-mono !text-muted hover:!text-frost transition-colors"
          >
            Mentoría
          </Link>
          <Link
            to="/herramientas/foundational-docs"
            className="label-mono !text-muted hover:!text-frost transition-colors"
          >
            Herramientas
          </Link>
          <a href="/#contacto" className="btn-pill-light">
            Hablemos <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </nav>

        {/* Botón hamburguesa (solo mobile) */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-star-light/15 text-frost transition-colors hover:border-star-light/45"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Panel de nav mobile */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-star-light/15 bg-space-950/95 backdrop-blur-md px-6 py-6 flex flex-col gap-5">
          <a
            href="/#servicios"
            onClick={closeMobile}
            className="label-mono !text-muted hover:!text-frost transition-colors"
          >
            Servicios
          </a>
          <a
            href="/#experiencia"
            onClick={closeMobile}
            className="label-mono !text-muted hover:!text-frost transition-colors"
          >
            Experiencia
          </a>
          <Link
            to="/blog"
            onClick={closeMobile}
            className="label-mono !text-muted hover:!text-frost transition-colors"
          >
            Blog
          </Link>
          <Link
            to="/mentoria-dropshipping"
            onClick={closeMobile}
            className="label-mono !text-muted hover:!text-frost transition-colors"
          >
            Mentoría
          </Link>
          <Link
            to="/herramientas/foundational-docs"
            onClick={closeMobile}
            className="label-mono !text-muted hover:!text-frost transition-colors"
          >
            Herramientas
          </Link>
          <a href="/#contacto" onClick={closeMobile} className="btn-pill-light w-fit">
            Hablemos <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-star-light/15">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-star-light/15">
          <div>
            <p className="font-display font-bold text-xl mb-3">Samuel González</p>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              Data · Marketing · Code. Más de 10 años convirtiendo datos en decisiones y
              campañas en resultados.
            </p>
          </div>
          <div>
            <h4 className="label-mono !text-muted mb-4">Sitio</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <a href="/#servicios" className="text-ice hover:text-star-light transition-colors">
                Servicios
              </a>
              <a href="/#experiencia" className="text-ice hover:text-star-light transition-colors">
                Experiencia
              </a>
              <Link to="/blog" className="text-ice hover:text-star-light transition-colors">
                Blog
              </Link>
              <Link
                to="/herramientas/foundational-docs"
                className="text-ice hover:text-star-light transition-colors"
              >
                Documentos Fundacionales
              </Link>
              <Link
                to="/mentoria-dropshipping"
                className="text-ice hover:text-star-light transition-colors"
              >
                Mentoría Dropshipping
              </Link>
            </div>
          </div>
          <div>
            <h4 className="label-mono !text-muted mb-4">Conecta</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <a
                href="https://www.linkedin.com/in/samuelgonzalez/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ice hover:text-star-light transition-colors inline-flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
              <a
                href="/#contacto"
                className="text-ice hover:text-star-light transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> Contacto
              </a>
            </div>
          </div>
        </div>
        <p className="text-muted text-xs pt-8">
          © {new Date().getFullYear()} Samuel González · Data · Marketing · Code
        </p>
      </div>
    </footer>
  );
}

function HomePage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

  const latestPosts = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);

  // Codifica los datos del formulario como x-www-form-urlencoded,
  // el formato que espera el endpoint de Netlify Forms.
  const encodeFormData = (data: Record<string, string>) =>
    Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = formRef.current;
    if (!form) {
      setSending(false);
      return;
    }

    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = String(value);
    });

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormData(data),
      });

      if (!response.ok) {
        throw new Error(`Netlify Forms respondió con estado ${response.status}`);
      }

      setFormStatus({
        message: '¡Mensaje enviado con éxito! Me pondré en contacto contigo pronto.',
        type: 'success',
      });
      form.reset();
    } catch (error) {
      console.error('Error al enviar el formulario a Netlify:', error);
      setFormStatus({
        message: 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.',
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-950 text-frost">
      {/* ===== Hero: titular roto + bloques de "foto", estilo nik.co ===== */}
      <section className="pt-14 pb-8 md:pt-20 md:pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-5 items-center">
            <h1 className="display-xl text-[13vw] sm:text-6xl md:text-7xl lg:text-8xl">
              Data, Marketing
              <br />
              y Code al
            </h1>
            <HeroPhoto
              src="/hero-waterfall.jpg"
              alt="Pareja en una banca frente a una cascada iluminada, Cataratas del Niágara"
              className="h-56 md:h-72"
              parallaxSpeed={0.08}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mt-4 md:mt-5 items-center">
            <HeroPhoto
              src="/hero-moon.jpg"
              alt="Luna en cuarto creciente fotografiada en Perú"
              className="h-24 md:h-32"
              parallaxSpeed={0.06}
              zoom={1.1}
            />
            <h2 className="display-xl text-3xl sm:text-4xl md:text-6xl">
              Servicio de marcas
            </h2>
            <h2 className="display-xl text-3xl sm:text-4xl md:text-6xl">que crecen</h2>
            <HeroPhoto
              src="/hero-sunset.jpg"
              alt="Atardecer sobre el lago Titicaca, entre Perú y Bolivia"
              className="h-24 md:h-32"
              parallaxSpeed={0.11}
            />
          </div>
          <p className="label-mono !text-muted !tracking-[0.15em] mt-5 md:mt-6">
            Fotografías propias, tomadas entre Perú y Bolivia en 2018.
          </p>
        </div>
      </section>

      <RolesMarquee />

      {/* ===== Tratamiento de nombre: ticker + nombre gigante ===== */}
      <section className="relative py-20 md:py-28 text-center border-t border-star-light/15 overflow-hidden">
        <Starfield />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 60% at 50% 0%, #1B2E66, transparent 70%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6">
          <p className="label-mono mb-6">Paid Media · Data Science · Growth · Full Stack</p>
          <div className="flex items-center justify-center gap-5 md:gap-8">
            <div className="hidden sm:flex w-16 h-16 md:w-24 md:h-24 rounded-full items-center justify-center shrink-0 photo-block !rounded-full">
              <Code2 className="w-6 h-6 md:w-8 md:h-8 text-star-light" />
            </div>
            <h1 className="display-xl text-5xl sm:text-7xl md:text-8xl lg:text-9xl">
              Samuel
              <br />
              González
            </h1>
            <div className="hidden sm:flex w-16 h-16 md:w-24 md:h-24 rounded-full items-center justify-center shrink-0 photo-block !rounded-full">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-star-light" />
            </div>
          </div>
          <p className="text-ice text-base md:text-lg max-w-xl mx-auto mt-8 leading-relaxed">
            <strong className="text-frost">Más de 10 años</strong> conectando adquisición pagada,
            analítica de datos y desarrollo para marcas que necesitan crecer con evidencia, no con
            corazonadas. <strong className="text-frost">Telefónica · UNICEF · Banco de Occidente · IFMG</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a href="#servicios" className="btn-star">
              Explorar servicios <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/blog" className="btn-ghost">
              Leer el blog
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Servicios: grid dividido, sin cards flotantes ===== */}
      <section id="servicios" className="border-t border-star-light/15">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <h2 className="display-xl text-4xl sm:text-5xl md:text-6xl mb-12 md:mb-16">
            Cómo puedo <span className="glow">aportar</span> a tu proyecto
          </h2>
          <div className="grid md:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className={`p-6 md:p-8 ${index > 0 ? 'md:border-l border-star-light/15 border-t md:border-t-0' : ''} ${
                  index > 0 ? 'mt-6 md:mt-0' : ''
                }`}
              >
                <span className="label-mono !text-star-light mb-5 block">{service.tag}</span>
                <div className="mb-5">{service.icon}</div>
                <h3 className="text-xl font-extrabold mb-3">{service.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Experiencia: filas alternadas, estilo "Brands" de nik.co ===== */}
      <section id="experiencia" className="border-t border-star-light/15">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <h2 className="display-xl text-4xl sm:text-5xl md:text-6xl mb-4">
            Experiencia <span className="glow">probada</span>
          </h2>
          <p className="text-muted mb-4">10+ años entre paid media, data y producto.</p>
        </div>
        {experiences.map((exp, index) => {
          const reverse = index % 2 === 1;
          return (
            <div key={index} className="border-t border-star-light/15 last:border-b">
              <div
                className={`max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-8 py-10 md:py-14 ${
                  reverse ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div>
                  <h3 className="display-xl text-3xl sm:text-4xl md:text-6xl mb-4">
                    {exp.company}
                  </h3>
                  <p className="text-star-light text-sm font-bold mb-1">{exp.position}</p>
                  <p className="label-mono !text-signal-teal !tracking-widest mb-4">{exp.period}</p>
                  <p className="text-muted text-sm leading-relaxed max-w-lg">{exp.description}</p>
                </div>
                <PhotoBlock className="h-40 md:h-56">
                  {exp.logo ? (
                    <div className="bg-frost/95 rounded-xl p-4 flex items-center justify-center w-4/5 h-2/3">
                      <img
                        src={exp.logo}
                        alt={exp.fullName}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <Code2 className="w-10 h-10 text-star-light opacity-70" />
                  )}
                </PhotoBlock>
              </div>
            </div>
          );
        })}
      </section>

      {/* ===== Docencia ===== */}
      <section className="border-t border-star-light/15">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="flex items-center gap-4 mb-10">
            <GraduationCap className="w-9 h-9 text-star-light shrink-0" />
            <div>
              <h3 className="text-xl font-extrabold">Docencia</h3>
              <p className="text-muted text-sm">No es teoría: es el sistema que aplico todos los días.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3">
            {teaching.map((uni, index) => (
              <div
                key={index}
                className={`p-6 flex items-center gap-5 ${
                  index > 0 ? 'sm:border-l border-star-light/15 border-t sm:border-t-0 mt-4 sm:mt-0' : ''
                }`}
              >
                <div className="bg-frost/95 rounded-xl p-3 flex items-center justify-center w-28 h-16 shrink-0">
                  <img
                    src={uni.logo}
                    alt={uni.name}
                    className="max-h-12 max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm mb-1">{uni.name}</h4>
                  <p className="text-star-light text-xs font-bold mb-1">{uni.course}</p>
                  <p className="text-muted text-xs">{uni.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Marcas ===== */}
      <section className="border-t border-star-light/15">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <h2 className="display-xl text-3xl sm:text-4xl md:text-5xl mb-10 text-center">
            Marcas que <span className="glow">confiaron</span>
          </h2>
          <LogosMarquee />
        </div>
      </section>

      {/* ===== Blog / Ideas: grid dividido, estilo nik.co ===== */}
      <section className="border-t border-star-light/15">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
            <h2 className="display-xl text-4xl sm:text-5xl md:text-6xl">Ideas recientes</h2>
            <Link to="/blog" className="btn-ghost !py-2.5 text-xs">
              Ver todo el blog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3">
            {latestPosts.map((post, index) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className={`block p-6 md:p-7 group ${
                  index > 0 ? 'md:border-l border-star-light/15 border-t md:border-t-0 mt-6 md:mt-0' : ''
                }`}
              >
                <span className="label-mono !text-star-light mb-4 block">{post.category}</span>
                <h3 className="text-lg font-extrabold mb-3 leading-snug group-hover:text-star-light transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <span className="text-star-light text-sm font-semibold inline-flex items-center gap-2">
                  Leer más <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>

          {/* Promo de la herramienta gratuita: único bloque del sitio con acento
              ámbar en vez de azul, a propósito, para que rompa el scroll. */}
          <div className="card-amber mt-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="label-mono !text-signal-amber mb-3 block">Herramienta gratuita</span>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2">
                Crea tus <span className="glow-amber">Documentos Fundacionales</span> con IA
              </h3>
              <p className="text-ice text-sm max-w-xl">
                Responde un cuestionario corto y recibe un prompt listo para generar tus 4
                documentos de marca en un Proyecto de Claude.
              </p>
            </div>
            <Link to="/herramientas/foundational-docs" className="btn-amber shrink-0">
              Probar la herramienta <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Contacto: titular gigante, estilo footer de nik.co ===== */}
      <section id="contacto" className="border-t border-star-light/15">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <h2 className="display-xl text-4xl sm:text-6xl md:text-7xl mb-4 text-center">
            Hablemos de tu <span className="glow">proyecto</span>
          </h2>
          <p className="text-muted text-center mb-12">
            Cuéntame qué necesitas y te responderé lo antes posible.
          </p>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            name="contacto"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            className="space-y-5"
          >
            {/* Requerido por Netlify Forms para asociar el envío con el formulario detectado en el build */}
            <input type="hidden" name="form-name" value="contacto" />
            {/* Honeypot antispam: invisible para personas, los bots suelen rellenarlo */}
            <p className="hidden">
              <label>
                No llenar si eres humano: <input name="bot-field" tabIndex={-1} autoComplete="off" />
              </label>
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="user_name" className="block text-sm font-semibold text-ice mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  required
                  className="w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3 text-frost placeholder-muted focus:border-star-light/45 focus:outline-none transition-colors"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label htmlFor="user_email" className="block text-sm font-semibold text-ice mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="user_email"
                  name="user_email"
                  required
                  className="w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3 text-frost placeholder-muted focus:border-star-light/45 focus:outline-none transition-colors"
                  placeholder="tucorreo@email.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-ice mb-2">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3 text-frost placeholder-muted focus:border-star-light/45 focus:outline-none transition-colors resize-y"
                placeholder="Cuéntame sobre tu proyecto..."
              />
            </div>
            <button type="submit" disabled={sending} className="btn-star w-full justify-center disabled:opacity-60">
              {sending ? 'Enviando...' : 'Enviar mensaje'} <Send className="w-4 h-4" />
            </button>
            {formStatus.type && (
              <p
                role="status"
                className={`text-sm text-center font-semibold ${
                  formStatus.type === 'success' ? 'text-signal-teal' : 'text-signal-amber'
                }`}
              >
                {formStatus.message}
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  // La página de Mentoría es un landing page de venta directa: el menú y el
  // footer son "fugas" que sacan al visitante antes de que convierta, así
  // que no se muestran en esa ruta (misma lógica que funnels de referencia
  // como masterescala.co).
  const isLandingPage = location.pathname.startsWith('/mentoria-dropshipping');

  return (
    <>
      {!isLandingPage && <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/herramientas/foundational-docs" element={<FoundationalDocsTool />} />
        <Route path="/mentoria-dropshipping" element={<DropshippingMentoria />} />
        <Route path="/google-ads-checklist" element={<GoogleAdsChecklist />} />
        <Route path="/recursos/google-ads-checklist" element={<GoogleAdsChecklist />} />
      </Routes>
      {!isLandingPage && <Footer />}
    </>
  );
}
