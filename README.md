# Holanda

Web universidad holanda: **Estudiar en Holanda**, una guía en español para estudiantes que van a estudiar a una universidad de Holanda.

Es una web estática (HTML, CSS y un poco de JavaScript), sin dependencias ni proceso de compilación.

- `index.html`: página de inicio (casas de canal, índice de temas y "Quién está detrás").
- Una página por tema: `llegada.html`, `alojamiento.html`, `ciudades.html`, `presupuesto.html`, `beca-duo.html`, `trabajo.html`, `holandes.html`, `bici-y-tren.html`, `seguro.html`, `comunidad.html`, `preguntas.html`, `calendario.html` (qué hacer cada mes) y `glosario.html` (palabras holandesas).
- `assets/compartir.png`: imagen que aparece al compartir el enlace en WhatsApp o redes.
- `css/styles.css`: estilos y paleta de colores (compartidos por todas las páginas).
- `js/main.js`: menú en móvil, calculadora de presupuesto y lista de llegada (se guarda en el navegador de cada persona).

El menú y el pie de página están repetidos en cada página: si cambias uno, cámbialo en todas.

Para verla, abre `index.html` en el navegador. Se publica con GitHub Pages desde la rama `main` en https://estudiarenholanda.github.io/estudiarenholanda/ y cuenta las visitas con GoatCounter (https://estudiarenholanda.goatcounter.com).

Las cifras (salario mínimo, beca DUO, seguro médico) están revisadas en noviembre de 2026; conviene actualizarlas cada año.

## Búsqueda

La página de inicio tiene un buscador que usa `assets/search-index.json`. Si cambias el texto de alguna página, vuelve a generar el índice con:

    python3 tools/build_search_index.py

El script también añade un `id` a los títulos nuevos para que los resultados lleven directamente a cada apartado.
