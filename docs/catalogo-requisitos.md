# Libro catálogo de requisitos por cultivo

Generado desde `data/catalogo.json` con `npm run catalogo`. La app compara tu zona con estos rangos («ideal» = óptimo, «aguanta» = límite absoluto). ECOCROP da rangos de la especie en el mundo; si hay dato local INIA, ese manda.

| Cultivo | Requisito | Ideal | Aguanta | Fuente |
|---|---|---|---|---|
| Papa (*Solanum tuberosum*) | Temperatura media del ciclo (°C) | 15 a 25 | 7 a 30 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1971) — temperatura media de los meses de cultivo |
| Papa (*Solanum tuberosum*) | Lluvia al año (mm) | 500 a 800 | 250 a 2000 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1971) |
| Papa (*Solanum tuberosum*) | pH del suelo | 5 a 6.2 | 4.2 a 8.5 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1971) |
| Papa (*Solanum tuberosum*) | Textura del suelo | media | fina, media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1971) |
| Papa (*Solanum tuberosum*) | Temperatura que mata (°C) |  | en crecimiento: -2.5; en reposo: -1 | [Ficha INIA (marmolejo2018)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1971) — la mayoría de las variedades cultivadas se dañan bajo −2,5 °C; ECOCROP da 0 °C para la papa común |
| Papa (*Solanum tuberosum*) | Altura (m) | 2500 a 4000 |  | [Ficha INIA (inia317)](https://core.ac.uk/download/490803592.pdf) — rango de la variedad (dato local, tiene prioridad) |
| Papa amarga (para chuño) (*Solanum x juzepczukii*) | Temperatura media del ciclo (°C) | 6 a 14 | 3 a 18 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=9916) — temperatura media de los meses de cultivo |
| Papa amarga (para chuño) (*Solanum x juzepczukii*) | Lluvia al año (mm) | 600 a 1200 | 400 a 1400 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=9916) |
| Papa amarga (para chuño) (*Solanum x juzepczukii*) | pH del suelo | 6 a 7 | 5.5 a 7.5 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=9916) |
| Papa amarga (para chuño) (*Solanum x juzepczukii*) | Textura del suelo | media | media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=9916) |
| Papa amarga (para chuño) (*Solanum x juzepczukii*) | Temperatura que mata (°C) |  | en crecimiento: -3 | [Ficha INIA (alcon2019)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=9916) — papas amargas: −3 °C (S. curtilobum) a −5 °C (S. juzepczukii, luk'i); se usa el valor más prudente |
| Papa amarga (para chuño) (*Solanum x juzepczukii*) | Altura (m) | 3800 a 4500 |  | [Calendario INIA 2025](https://repositorio.inia.gob.pe/handle/20.500.12955/2868) — rango de la variedad (dato local, tiene prioridad) |
| Quinua (*Chenopodium quinoa*) | Temperatura media del ciclo (°C) | 14 a 18 | 2 a 35 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2509) — temperatura media de los meses de cultivo |
| Quinua (*Chenopodium quinoa*) | Lluvia al año (mm) | 500 a 1000 | 250 a 2600 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2509) |
| Quinua (*Chenopodium quinoa*) | pH del suelo | 5.5 a 7.8 | 4.5 a 9.5 | [Salcedo (quinua) + ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2509) — rango óptimo de la ficha Salcedo INIA; rango aceptable de ECOCROP |
| Quinua (*Chenopodium quinoa*) | Textura del suelo | fina, media, gruesa | fina, media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2509) |
| Quinua (*Chenopodium quinoa*) | Temperatura que mata (°C) |  | en crecimiento: -8; en reposo: -8 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2509) |
| Quinua (*Chenopodium quinoa*) | Altura (m) | 1284 a 3950 |  | [Salcedo (quinua)](https://pgc-snia.inia.gob.pe:8443/jspui/bitstream/inia/78/1/Trip-Quinua_Salcedo_INIA.pdf) — rango de la variedad (dato local, tiene prioridad) |
| Cebada (*Hordeum vulgare*) | Temperatura media del ciclo (°C) | 15 a 20 | 2 a 40 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1232) — temperatura media de los meses de cultivo |
| Cebada (*Hordeum vulgare*) | Lluvia al año (mm) | 500 a 1000 | 200 a 2000 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1232) |
| Cebada (*Hordeum vulgare*) | pH del suelo | 6.5 a 7.5 | 6 a 8 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1232) |
| Cebada (*Hordeum vulgare*) | Textura del suelo | media | fina, media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1232) |
| Cebada (*Hordeum vulgare*) | Temperatura que mata (°C) |  | en crecimiento: 0; en reposo: -4 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1232) |
| Cebada (*Hordeum vulgare*) | Altura (m) |  | hasta 4400 | [ECOCROP (FAO)](https://www.fao.org/land-water/resources/tools/databases/ecocrop/en) — máximo general de la especie |
| Oca (*Oxalis tuberosa*) | Temperatura media del ciclo (°C) | 12 a 24 | 5 a 28 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2371) — temperatura media de los meses de cultivo |
| Oca (*Oxalis tuberosa*) | Lluvia al año (mm) | 800 a 1300 | 570 a 2150 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2371) |
| Oca (*Oxalis tuberosa*) | pH del suelo | 6 a 7 | 5.3 a 7.8 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2371) |
| Oca (*Oxalis tuberosa*) | Textura del suelo | media, gruesa | fina, media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2371) |
| Oca (*Oxalis tuberosa*) | Temperatura que mata (°C) |  |  | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2371) |
| Oca (*Oxalis tuberosa*) | Altura (m) |  | hasta 4000 | [ECOCROP (FAO)](https://www.fao.org/land-water/resources/tools/databases/ecocrop/en) — máximo general de la especie |
| Haba (*Vicia faba*) | Temperatura media del ciclo (°C) | 18 a 28 | 5 a 32 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2146) — temperatura media de los meses de cultivo |
| Haba (*Vicia faba*) | Lluvia al año (mm) | 650 a 1000 | 250 a 2600 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2146) |
| Haba (*Vicia faba*) | pH del suelo | 6 a 7 | 4.5 a 8.6 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2146) |
| Haba (*Vicia faba*) | Textura del suelo | media | fina, media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2146) |
| Haba (*Vicia faba*) | Temperatura que mata (°C) |  |  | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2146) |
| Haba (*Vicia faba*) | Altura (m) | 3000 a 3870 |  | [Calendario INIA 2025](https://repositorio.inia.gob.pe/handle/20.500.12955/2868) — rango de la variedad (dato local, tiene prioridad) |
| Avena forrajera (*Avena sativa*) | Temperatura media del ciclo (°C) | 16 a 20 | 5 a 30 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=481) — temperatura media de los meses de cultivo |
| Avena forrajera (*Avena sativa*) | Lluvia al año (mm) | 600 a 1000 | 250 a 1500 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=481) |
| Avena forrajera (*Avena sativa*) | pH del suelo | 5 a 6 | 4.5 a 7.5 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=481) |
| Avena forrajera (*Avena sativa*) | Textura del suelo | fina, media, gruesa | fina, media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=481) |
| Avena forrajera (*Avena sativa*) | Temperatura que mata (°C) |  | en crecimiento: -1; en reposo: -15 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=481) |
| Avena forrajera (*Avena sativa*) | Altura (m) | 3812 a 4000 |  | [Calendario INIA 2025](https://repositorio.inia.gob.pe/handle/20.500.12955/2868) — rango de la variedad (dato local, tiene prioridad) |
| Tarwi (chocho) (*Lupinus mutabilis*) | Temperatura media del ciclo (°C) | 18 a 24 | 6 a 30 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7435) — temperatura media de los meses de cultivo |
| Tarwi (chocho) (*Lupinus mutabilis*) | Lluvia al año (mm) | 500 a 1000 | 350 a 1700 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7435) |
| Tarwi (chocho) (*Lupinus mutabilis*) | pH del suelo | 5 a 6.5 | 4.5 a 7 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7435) |
| Tarwi (chocho) (*Lupinus mutabilis*) | Textura del suelo | media, gruesa | fina, media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7435) |
| Tarwi (chocho) (*Lupinus mutabilis*) | Temperatura que mata (°C) |  | en crecimiento: -5; en reposo: -5 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=7435) |
| Tarwi (chocho) (*Lupinus mutabilis*) | Altura (m) | 3000 a 3700 |  | [Calendario INIA 2025](https://repositorio.inia.gob.pe/handle/20.500.12955/2868) — rango de la variedad (dato local, tiene prioridad) |
| Cañihua (*Chenopodium pallidicaule*) | Temperatura media del ciclo (°C) | 10 a 16 | 5 a 28 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=4494) — temperatura media de los meses de cultivo |
| Cañihua (*Chenopodium pallidicaule*) | Lluvia al año (mm) | 500 a 800 | 300 a 1100 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=4494) |
| Cañihua (*Chenopodium pallidicaule*) | pH del suelo | 6 a 7.5 | 4.8 a 8.5 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=4494) |
| Cañihua (*Chenopodium pallidicaule*) | Textura del suelo | media, gruesa | fina, media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=4494) |
| Cañihua (*Chenopodium pallidicaule*) | Temperatura que mata (°C) |  | en crecimiento: -3; en reposo: -10 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=4494) |
| Cañihua (*Chenopodium pallidicaule*) | Altura (m) | 3815 a 4000 |  | [Calendario INIA 2025](https://repositorio.inia.gob.pe/handle/20.500.12955/2868) — rango de la variedad (dato local, tiene prioridad) |
| Olluco (*Ullucus tuberosus*) | Temperatura media del ciclo (°C) | 12 a 20 | 5 a 28 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2120) — temperatura media de los meses de cultivo |
| Olluco (*Ullucus tuberosus*) | Lluvia al año (mm) | 1100 a 1400 | 800 a 1800 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2120) |
| Olluco (*Ullucus tuberosus*) | pH del suelo | 5.5 a 6.5 | 5 a 7 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2120) |
| Olluco (*Ullucus tuberosus*) | Textura del suelo | media | fina, media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2120) |
| Olluco (*Ullucus tuberosus*) | Temperatura que mata (°C) |  | en crecimiento: 0; en reposo: -4 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2120) |
| Olluco (*Ullucus tuberosus*) | Altura (m) |  | hasta 4000 | [ECOCROP (FAO)](https://www.fao.org/land-water/resources/tools/databases/ecocrop/en) — máximo general de la especie |
| Trigo (*Triticum aestivum*) | Temperatura media del ciclo (°C) | 15 a 23 | 5 a 27 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2114) — temperatura media de los meses de cultivo |
| Trigo (*Triticum aestivum*) | Lluvia al año (mm) | 750 a 900 | 300 a 1600 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2114) |
| Trigo (*Triticum aestivum*) | pH del suelo | 6 a 7 | 5.5 a 8.5 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2114) |
| Trigo (*Triticum aestivum*) | Textura del suelo | media | fina, media | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2114) |
| Trigo (*Triticum aestivum*) | Temperatura que mata (°C) |  | en crecimiento: 0; en reposo: -20 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2114) |
| Trigo (*Triticum aestivum*) | Altura (m) |  | hasta 4500 | [ECOCROP (FAO)](https://www.fao.org/land-water/resources/tools/databases/ecocrop/en) — máximo general de la especie |
| Arveja grano seco (*Pisum sativum*) | Temperatura media del ciclo (°C) | 10 a 24 | 4 a 30 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1721) — temperatura media de los meses de cultivo |
| Arveja grano seco (*Pisum sativum*) | Lluvia al año (mm) | 800 a 1200 | 350 a 2500 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1721) |
| Arveja grano seco (*Pisum sativum*) | pH del suelo | 5.5 a 7 | 4.5 a 8.3 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1721) |
| Arveja grano seco (*Pisum sativum*) | Textura del suelo | fina, media, gruesa | fina, media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1721) |
| Arveja grano seco (*Pisum sativum*) | Temperatura que mata (°C) |  | en crecimiento: 0; en reposo: -2 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1721) |
| Maíz amiláceo (*Zea mays*) | Temperatura media del ciclo (°C) | 18 a 33 | 10 a 47 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2175) — temperatura media de los meses de cultivo |
| Maíz amiláceo (*Zea mays*) | Lluvia al año (mm) | 600 a 1200 | 400 a 1800 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2175) |
| Maíz amiláceo (*Zea mays*) | pH del suelo | 5 a 7 | 4.5 a 8.5 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2175) |
| Maíz amiláceo (*Zea mays*) | Temperatura que mata (°C) |  |  | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=2175) |
| Maíz amiláceo (*Zea mays*) | Altura (m) |  | hasta 4000 | [ECOCROP (FAO)](https://www.fao.org/land-water/resources/tools/databases/ecocrop/en) — máximo general de la especie |
| Alfalfa (*Medicago sativa*) | Temperatura media del ciclo (°C) | 21 a 27 | 5 a 45 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1428) — temperatura media de los meses de cultivo |
| Alfalfa (*Medicago sativa*) | Lluvia al año (mm) | 600 a 1200 | 350 a 2700 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1428) |
| Alfalfa (*Medicago sativa*) | pH del suelo | 6.5 a 7.5 | 4.3 a 8.7 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1428) |
| Alfalfa (*Medicago sativa*) | Textura del suelo | media, gruesa | media, gruesa | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1428) |
| Alfalfa (*Medicago sativa*) | Temperatura que mata (°C) |  | en crecimiento: 0; en reposo: -25 | [ECOCROP (FAO)](https://ecocrop.apps.fao.org/ecocrop/srv/en/dataSheet?id=1428) |
| Alfalfa (*Medicago sativa*) | Altura (m) |  | hasta 4000 | [ECOCROP (FAO)](https://www.fao.org/land-water/resources/tools/databases/ecocrop/en) — máximo general de la especie |

## ¿Por qué estos cultivos?

Son los cultivos del altiplano que aparecen en las estadísticas oficiales de siembra de Puno (MIDAGRI / Dirección Regional Agraria). Los de ceja de selva (café, arroz, yuca, maíz amarillo duro) no entran en el MVP del altiplano.

- **Olluco**: 2 796 ha de intención de siembra en Puno (ENIS 2015-2016) (enis2015, draPuno2023)
- **Trigo**: 1 521 ha de intención de siembra en Puno (ENIS 2015-2016) (enis2015)
- **Arveja grano seco**: 1 188 ha de intención de siembra en Puno (ENIS 2015-2016) (enis2015, draPuno2023). Pendiente: ECOCROP da un máximo de 2700 m, pero la DRA Puno registra siembras de arveja en el departamento: falta una ficha local de altura (no se usa la altura hasta tenerla).
- **Maíz amiláceo**: 4 063 ha de intención de siembra en Puno (ENIS 2015-2016) (enis2015). Pendiente: ECOCROP trata el maíz en general, no la raza amilácea andina; falta ficha local. Sin dato de textura en ECOCROP.
- **Alfalfa**: cultivo forrajero registrado por la DRA Puno (bcrpPuno2021, draPuno2023). Pendiente: Es perenne: ocupa la chacra más de una campaña; la rotación anual no lo trata aún.

## Fuentes

- **inia317**: Instituto Nacional de Innovación Agraria. (s. f.). Papa INIA 317 – Altiplano [Plegable]. Estación Experimental Agraria Illpa-Puno. https://core.ac.uk/download/490803592.pdf
- **salcedo**: Instituto Nacional de Innovación Agraria. (s. f.). Quinua Salcedo INIA [Plegable]. https://pgc-snia.inia.gob.pe:8443/jspui/bitstream/inia/78/1/Trip-Quinua_Salcedo_INIA.pdf
- **inia902**: Instituto Nacional de Innovación Agraria. (s. f.). Avena INIA 902 – Africana [Plegable]. Estación Experimental Agraria Illpa-Puno. https://pgc-snia.inia.gob.pe:8443/jspui/bitstream/inia/657/3/Trip-Avena-INIA902.pdf
- **avenaPunaSeca**: Instituto Nacional de Innovación Agraria. (s. f.). Cultivo y henificación de avena forrajera en puna seca. https://pgc-snia.inia.gob.pe:8443/jspui/bitstream/inia/1043/1/Inia-Cultivo_y_henificaci%c3%b3n_de_avena_forrajera.pdf
- **nematodo**: Instituto Nacional de Innovación Agraria y Plantwise. (2019, octubre). Nematodo del quiste de la papa [Hoja volante]. https://repositorio.inia.gob.pe/bitstreams/eb1d835e-5367-4f17-8323-8a85d6ede08f/download
- **aynoka**: Chila, M. (2002). Manejo tradicional de la biodiversidad cultivada. Biodiversidad, 31, 15 (verificar título). https://grain.org/media/W1siZiIsIjIwMTEvMDcvMjUvMDZfMjhfMDJfOTNfYmlvZGl2MzFfM19jaGlsYS5wZGYiXV0
- **quinuaHeladaEtapa**: Jacobsen, S. E., Monteros, C., Christiansen, J. E., & Mujica, A. (s. f.). Respuesta de la quinua a heladas [Registro AGRIS; verificar]. https://agris.fao.org/search/ru/records/6878df965d9ad5f58d604635
- **heladaFao**: Helada meteorológica: temperatura del aire igual o menor a 0 °C (FAO-Senamhi). https://dialnet.unirioja.es/descarga/articulo/6480004.pdf
- **canihua406**: Instituto Nacional de Innovación Agraria. (s. f.). Nueva variedad de cañihua INIA 406 – Illpa [Plegable]. Estación Experimental Agraria Illpa-Puno. https://pgc-snia.inia.gob.pe:8443/jspui/bitstream/inia/697/1/Trip-Ca%2b%c2%a6ihua-INIA406.pdf
- **haba401**: Instituto Nacional de Innovación Agraria. (s. f.). Haba INIA 401 – Cusco [Plegable]. Para la sierra sur y centro del Perú. https://pgc-snia.inia.gob.pe:8443/jspui/bitstream/inia/718/3/Trip-Haba-INIA401.pdf
- **spi**: Organización Meteorológica Mundial. (2012). Guía del usuario sobre el Índice normalizado de precipitación (OMM-N.º 1090) (M. Svoboda, M. Hayes y D. Wood). Ginebra. https://public.wmo.int/en/resources/library/standardized-precipitation-index-user-guide
- **calendarioSierra**: Lobato Gálvez, R. H., et al. (2025). Calendario agrícola: Región Sierra. Instituto Nacional de Innovación Agraria. https://repositorio.inia.gob.pe/handle/20.500.12955/2868
- **ecocrop**: Organización de las Naciones Unidas para la Alimentación y la Agricultura. (s. f.). ECOCROP: base de datos de requisitos de cultivos. Disponible en la plataforma GAEZ v4. https://www.fao.org/land-water/resources/tools/databases/ecocrop/en
- **enis2015**: León Carrasco, J. C. (2015, 26 de junio). Puno sembraría más de 150 mil has de cultivos transitorios [Resultados preliminares de la Encuesta Nacional de Intenciones de Siembra 2015-2016, Ministerio de Agricultura y Riego]. Agraria.pe. https://agraria.pe/noticias/puno-sembraria-mas-de-150-mil-8559
- **draPuno2023**: Red de Medios Regionales del Perú. (2023, 21 de marzo). Puno: Déficit hídrico impacta campaña agrícola 2022-2023 y especialmente en producción de quinua [Reporte de pérdidas y afectaciones por cultivo, Dirección Regional Agraria Puno]. El Búho. https://elbuho.pe/?p=283702
- **bcrpPuno2021**: Banco Central de Reserva del Perú, Sucursal Puno. (2021). Puno: Síntesis de actividad económica, marzo 2021 [Datos de la Dirección Regional Agraria Puno]. https://www.bcrp.gob.pe/docs/Sucursales/Puno/2021/presentacion-puno-03-2021.pdf
- **marmolejo2018**: Marmolejo Gutarra, D., & Ruiz Velásquez, J. E. (2018). Tolerancia de papas nativas (Solanum spp.) a heladas en el contexto de cambio climático. Scientia Agropecuaria, 9(3), 393–400. https://doi.org/10.17268/sci.agropecu.2018.03.10 https://doi.org/10.17268/sci.agropecu.2018.03.10
- **alcon2019**: Alcon Callejas, D., Bonifacio Flores, A., & Taboada Belmonte, C. (2019). Caracterización morfológica de tubérculos de la papa amarga según el diálogo de saberes. Revista de Investigación e Innovación Agropecuaria y de Recursos Naturales, 6(2), 7–20. https://riiarn.umsa.bo/index.php/RIIARn/article/download/123/109/339
