# Plan de marca personal — Jose Uribe

**Fecha:** 2026-09-06
**Estado:** aprobado el 2026-09-06 (con ajustes de Jose: capturas desde Upwork, Zohara vuelve, GA4 sí). Spec técnico del sitio: `2026-09-06-sitio-joseuribe-dev-design.md`
**Sustituye a:** el posicionamiento de Overnatic (WaaS / custodia bajo suscripción)

---

## 1. Por qué existe este documento

Overnatic lleva vivo desde febrero de 2026 y no ha producido **un solo lead**. Antes de reescribir nada, medimos por qué.

### Evidencia recogida (2026-09-06)

**Tráfico real, últimos 30 días (Vercel Analytics):**

| Dato | Valor |
|---|---|
| Visitantes | 103 (−41% vs. periodo anterior) |
| Origen | **91% China, referidos por `m.baidu.com`** — scrapers, no compradores |
| Humanos plausibles | ~9 (el 9% de EE.UU.) |
| Rebote | 97% |
| Páginas visitadas | Solo posts de blog. **Cero visitas a `/planes`, `/portafolio`, home** |

**Posiciones en Google (SERP en vivo, Colombia):**

| Consulta | Posición |
|---|---|
| `mantenimiento wordpress para empresas` | No aparece en el top 98 |
| `agencia de desarrollo web cali` | No aparece en el top 99 |
| `wordpress hackeado que hacer` | **69** (página 7 — cero clics) |

### Conclusión

La propuesta de valor nunca fue el cuello de botella: **nadie la leyó**. En siete meses ninguna persona real llegó a la página de precios. Reescribir el mensaje no habría producido un lead.

Fallaron tres cosas a la vez:

1. **Distribución.** El sitio no tiene forma de que alguien lo encuentre, y el blog compite sin autoridad de dominio contra medios establecidos.
2. **Oferta.** La suscripción de custodia ($99–159/mes) tiene cero ventas validadas. Lo que el mercado sí compró fueron builds one-off. Y el freno declarado por los prospectos es no querer amarrarse desde el primer día.
3. **Prueba.** El sitio mostraba 2 casos. El portafolio real son 12 proyectos, 7 de ellos vivos y verificables.

Este plan corrige las tres.

---

## 2. Decisiones tomadas

| Decisión | Valor | Nota |
|---|---|---|
| Marca | **Marca personal pura** — Jose Uribe | Overnatic se retira. No se registraría como empresa, así que seguir posicionándolo es invertir en un activo desechable |
| Dominio | **joseuribe.dev** | Verificado libre por DNS el 2026-09-06. Confirmar en el registrador antes de comprar |
| Audiencia primaria | **Mercado angloparlante (EE.UU. principalmente)** | La oferta elegida ya decide la audiencia — ver §3 |
| Idiomas | EN (original) → ES (completo al lanzar) → PT (después) | PT no debe retrasar el lanzamiento |
| Oferta principal | Reemplazo de WordPress: sitios en Astro + CMS moderno | Ver §4 |
| Tema del blog | **La vida después de WordPress** | Coherente con la oferta |
| Migración | **Empezar limpio** — sin 301 desde overnatic.us | Ver §8 |
| Demos por sector | **Retirados** | No representan trabajo consciente ni real |
| CMS | **Sanity** | Comparativa del 2026-09-06: Keystatic roto en Astro 6; Sveltia exige GitHub al cliente; Tina exige SSR. Sanity: estático, login por email, edición visual, MCP oficial ya existe |

---

## 3. Posicionamiento

### La frase

> **Jose Uribe — construyo el sitio que reemplaza tu WordPress.**
> Rápido, seguro, y editable sin miedo a romperlo.

### A quién le habla

**Primario:** negocios y equipos de marketing en EE.UU. atrapados en un WordPress que se cae, va lento, o les cobra mantenimiento todos los meses.

**Secundario:** agencias que necesitan un socio de desarrollo nearshore — misma jornada laboral, tarifa razonable, y alguien que responde.

**Terciario (referidos):** su red en Colombia y LATAM. Sigue siendo válida, pero no es a quien se le escribe el copy.

### Contra qué compite

| Alternativa | Su debilidad | El argumento |
|---|---|---|
| Quedarse en WordPress | Lento, se hackea, plugins que se pelean, costo mensual perpetuo | "Estás pagando una suscripción por que no se caiga" |
| Agencia establecida | Cara, lenta, capas de gente entre tú y quien escribe el código | "Hablas con quien lo construye" |
| Freelancer barato | Entrega y desaparece; sin criterio de arquitectura | "12 proyectos, 7 vivos hoy — puedes abrirlos" |
| Wix / Squarespace | Techo bajo, sin control, rendimiento pobre | "Cuando tu negocio crece, la plantilla se queda corta" |

### Por qué esta audiencia y no LATAM

La oferta decidió la audiencia. "Reemplazo de WordPress con Astro y CMS moderno" es una compra que **ya existe y se busca activamente** en el mercado angloparlante: ese comprador sabe qué es un headless CMS, mira Lighthouse y entiende por qué salir de WordPress.

En LATAM el mismo cliente rara vez siente ese dolor — quiere una página bonita y barata. Venderle arquitectura y rendimiento exige educar el mercado primero, que es lo más caro que existe para alguien que trabaja en las tardes.

Tres ventajas concretas en el mercado angloparlante:

1. **Canal ya validado.** Upwork: 100% Job Success, 10 trabajos, $35/hr. Es el único lugar donde ha llegado demanda real y comprobada.
2. **El contenido ya está en inglés.** Los posts y las descripciones del portafolio están escritos y bien escritos. El inglés es el original, no trabajo extra.
3. **Nearshore.** Cali comparte huso horario con la costa este de EE.UU. (o está a una hora). Jornada compartida es una ventaja concreta frente a Europa del Este o India, que es contra quien compite por precio.

**Contra honesta:** se pierde la cercanía cultural y el WhatsApp, terreno natural de Jose. Se acepta porque la red caliente local ya se agotó una vez y las tarifas locales tienen techo bajo.

---

## 4. La oferta

### Fase 1 — lo que se vende desde el día uno

**Sitios en Astro con CMS moderno, como reemplazo de WordPress.**

- Alcance cerrado y **precio fijo por proyecto** (no por hora), pago único. **Sin mensualidad en la puerta de entrada.**
- **La cifra concreta está sin definir.** Se fija con las primeras conversaciones reales, no desde el escritorio. Referencia de partida: su tarifa actual en Upwork es $35/hr, y esta oferta debería posicionarse por encima.
- CMS: **Sanity** (decidido tras comparativa — ver spec del sitio). **No se construye un CMS propio** — es un agujero sin fondo y no es lo que el cliente compra.
- Lo que se vende no es el CMS: es **editar sin miedo a romper nada**.
- El mantenimiento existe, pero se ofrece **después**, a clientes que ya trabajaron con él. Nunca como entrada.

**Segunda línea, respaldada por el portafolio:** aplicaciones web a medida — wizards de contratación, calculadoras, portales, plataformas (Armony, Klicana, Miami Trading Lab, Avgust).

### Fase 2 — el diferenciador, cuando haya clientes

**Editar el sitio hablando con una IA.** Con Sanity esto **ya existe y es oficial** (`mcp.sanity.io`): no hay que construir un servidor MCP para el contenido. Lo que sí puede construirse después es un MCP propio para lo que Sanity no cubre — despliegues, cambios de diseño, métricas — cuando un cliente lo justifique.

**Advertencia de posicionamiento:** este MCP es, sobre todo, **una ventaja de costo para Jose**, no una función que el cliente opere. Exige que el cliente tenga Claude o ChatGPT conectado y sepa usarlo — fricción real para una pyme. Su valor verdadero es permitir atender muchos sitios en pocas horas, y por eso cobrar menos que una agencia ganando más.

Se comunica como sorpresa agradable, **nunca como el eje de la venta**.

### La prueba

| Evidencia | Detalle |
|---|---|
| 12 proyectos reales | 7 sitios de clientes vivos y verificados (HTTP 200 al 2026-09-06) |
| Los dos lados del argumento | 3 sitios WordPress (Hablo Portugués, Affine, SIAMO) y 4 en Astro (Enlace, Stephania López, Serendipia) — *"construí ambos, y te cuento por qué me pasé"* |
| El sitio propio | joseuribe.dev es la primera instancia del producto: hecho con lo que vende, editado como lo vendería |
| Reputación externa | Upwork 100% JSS, 10 trabajos |

### Qué se publica y qué no

**Regla:** se publica solo lo que tenga captura real. Nada de tarjetas vacías.

**Se publican los 12.** Las capturas de los 7 sitios vivos se toman con Playwright; las de Klicana, Miami Trading Lab, Avgust y Zohara **existen en el portafolio de Upwork** y se descargan de ahí.

**Zohara:** `zohara.co` está parqueado **temporalmente** (redirige a `router.parklogic.com`). Se publica con captura pero **sin enlace vivo** hasta que el dominio vuelva; el campo `url` queda vacío y la tarjeta no muestra "ver sitio".

**Fichas completas (4):** Armony, Avgust, Klicana y Enlace.

---

## 5. Identidad

**Nombre:** Jose Uribe. Sin nombre de estudio. Si más adelante registra empresa, puede llamarse distinto sin afectar el sitio.

**Voz:** primera persona singular. Directa, concreta, sin jerga de agencia. Técnica cuando aporta y llana cuando no. Muestra el trabajo en vez de adjetivarlo. Nada de "somos un equipo apasionado".

**Dirección visual:** cálida y editorial, no el azul genérico de SaaS. Un solo acento usado con intención. **El protagonista visual son los proyectos** — el sitio actual no muestra ni uno solo, y ese es su mayor defecto. La ejecución visual se define en el proyecto del sitio, no aquí.

---

## 6. Arquitectura de contenido

```
/                 Home — qué construye, trabajo destacado, cómo trabaja, contacto
/work             Los proyectos con captura, filtrables por tipo (App · Astro · WordPress)
/work/[slug]      Ficha completa solo para los mejores (ver §4: depende de que exista captura)
/services         Reemplazo de WordPress · Apps a medida · (mantenimiento, al final)
/blog             Life after WordPress
/about            Quién es, dónde está, cómo trabaja
```

### El blog: "Life after WordPress"

El motor de contenido que Jose gestiona él mismo. Temas:

- Migraciones reales de WordPress a Astro: qué se gana, qué se pierde, cuándo **no** conviene
- Rendimiento y Core Web Vitals con números medidos, no teoría
- Seguridad: por qué WordPress se hackea y qué cambia sin él
- Comparativas honestas de CMS modernos
- El costo real de un sitio a 3 años (hosting + plugins + mantenimiento vs. estático)

**Cadencia realista: 2 posts al mes.** Es un negocio paralelo a un empleo de tiempo completo; prometer más es garantizar el abandono.

**Sobre los 24 posts de Overnatic:** la decisión es empezar limpio, sin migración técnica ni 301. Los mejores posts pueden **reescribirse y republicarse** como contenido nuevo — pero si eso se hace, `overnatic.us` debe quedar apagado o con `noindex` para no crear contenido duplicado.

---

## 7. Distribución

**Esta sección es obligatoria y es la que faltó en Overnatic.** Un plan de marca sin distribución es el mismo error con mejor tipografía. El sitio no genera demanda: la convierte.

Ordenados por cercanía a un lead real:

### 1. Upwork — el más rápido, y el único validado
Es el único canal donde ya llegó demanda comprobada. Acciones: reorientar el perfil hacia la oferta ("WordPress replacement / Astro + headless CMS"), enlazar joseuribe.dev como portafolio, y postular de forma sostenida. **Es la vía más corta al primer lead y la única que puede producirlo este mes.**

### 2. Outbound a agencias
Agencias pequeñas de EE.UU. que necesitan un socio de desarrollo nearshore. Pitch: misma jornada, tarifa razonable, alguien que responde. Ciclo más largo pero clientes que se repiten.

### 3. Contenido y SEO en inglés
El juego largo. El contenido ya existe y el tema está elegido. **No producirá un lead en los primeros meses** — se hace porque compone con el tiempo, no porque resuelva lo urgente.

### 4. Comunidades
Discord de Astro, r/webdev, Indie Hackers. Aportar donde tenga algo real que decir, con el sitio en la firma. Barato y lento.

### Regla de asignación de esfuerzo
Mientras no haya un cliente pagando, **la mayor parte del tiempo va a los canales 1 y 2** — los que hablan con humanos. El sitio y el contenido son soporte de esa conversación, no un sustituto.

---

## 8. Migración desde Overnatic

- **Sin 301 ni migración de SEO.** Se empieza limpio.
- `overnatic.us` se apaga cuando joseuribe.dev esté vivo. Conservar el dominio hasta que expire (barato) para no perder el correo de golpe.
- **Correo:** `jose@overnatic.us` → correo nuevo en joseuribe.dev. Avisar a clientes activos (Armony, y quien esté vivo en el pipeline).
- **Upwork:** actualizar las fichas que mencionan Overnatic. La ficha del propio sitio de Overnatic se reemplaza por la de joseuribe.dev.
- **CRM de Notion:** sigue siendo válido. Cambia la marca, no los contactos.
- **`v1/` (repo de Overnatic):** se congela. No se borra — es historial y contiene los posts reutilizables.

---

## 9. Métricas de éxito

**Objetivo declarado: al menos 1 lead al mes.** Un *lead* es una conversación real con alguien que tiene presupuesto y un problema concreto — no una visita ni un "me gusta".

Indicadores adelantados, en orden de importancia:

| Indicador | Meta inicial |
|---|---|
| Conversaciones iniciadas por semana (Upwork + outbound) | 5 |
| Propuestas enviadas por mes | 8 |
| Leads calificados por mes | 1 |
| Visitantes humanos al sitio | Medir de verdad — hoy no se puede |

**Obstáculo técnico detectado:** Vercel Analytics no permite *custom events* en el plan actual ("Upgrade to a Pro team"). Sin eso no se puede saber cuánta gente empieza un formulario ni dónde abandona. **Decidido: se añade GA4** (gratis, eventos sin límite) junto a Vercel Analytics.

---

## 10. Fuera de alcance

Explícito, porque aquí es donde se fue el tiempo antes:

- **No se construye un CMS propio.** Se usa uno existente.
- **No se construye ningún MCP propio.** El de contenido ya lo da Sanity; uno propio para despliegues/diseño es fase 2, cuando un cliente lo justifique.
- **El producto de flujos/wizards queda aparcado.** Fue una idea buena — un *interactive funnel builder* — pero la categoría está poblada (Heyflow, Involve.me, Outgrow desde $14–19/mes, con generación por IA desde febrero de 2026). Se retoma, si acaso, extrayéndolo del trabajo con clientes reales. **No se construye antes de vender.**
- **No se rediseñan ni se conservan los demos por sector.** Retirados.
- **No se invierte más en el blog de Overnatic.**

---

## 11. Siguientes pasos

1. Confirmar y comprar **joseuribe.dev** en el registrador.
2. Aprobar este plan.
3. Escribir el plan de implementación del **sitio personal** (proyecto 2).
4. Capturar los 7 sitios vivos con Playwright y descargar de Upwork las de Klicana, Miami Trading Lab, Avgust y Zohara.
5. Redactar el copy en inglés — partiendo de las descripciones del portafolio de Upwork, que ya están escritas.

---

## Anexo — El portafolio (12 proyectos)

| # | Proyecto | Tipo | URL viva | ¿Ficha completa? |
|---|---|---|---|---|
| 1 | Armony — wizard de contratación de planes | Web app | ✅ planes.armony.com.ec | ✅ Ficha |
| 2 | Klicana — plataforma de marketing de afiliados | Web app | ❌ (captura de Upwork) | ✅ Ficha |
| 3 | Miami Trading Lab — plataforma e-learning | Web app | ❌ (captura de Upwork) | — |
| 4 | Avgust — calculadora de huella de carbono con PDF | Web app | ❌ (captura de Upwork) | ✅ Ficha |
| 5 | Zohara — catálogo de villas | WordPress | ⏸ parqueado temporalmente — sin enlace | — |
| 6 | Enlace — sitio institucional de ONG | Astro | ✅ enlacepesquisa.org | ✅ Ficha |
| 7 | Overnatic | Astro | ⚠️ se apaga | — |
| 8 | Stephania López — portafolio de diseñadora | Astro | ✅ stephanialopez.co | — |
| 9 | Serendipia — bienestar corporativo | Astro | ✅ serendipialight.com | — |
| 10 | Hablo Portugués — sitio educativo | WordPress | ✅ habloportugues.com | — |
| 11 | Affine — sitio corporativo | WordPress | ✅ affine.com.co | — |
| 12 | SIAMO — servicios empresariales | WordPress | ✅ siamoservicios.com | — |

Verificado por HTTP el 2026-09-06.
