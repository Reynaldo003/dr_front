import conjuntosImg from "../assets/categories/conjuntos.jpg";
import vestidosImg from "../assets/categories/vestidos.jpg";
import chamarrasImg from "../assets/categories/chamarras.jpg";
import faldasImg from "../assets/categories/faldas.jpg";
import shortsImg from "../assets/categories/shorts.jpg";
import blusasImg from "../assets/categories/blusas.jpg";
import sacosImg from "../assets/categories/sacos.jpg";
import pantalonesImg from "../assets/categories/pantalones.jpg";
import blazersImg from "../assets/categories/Blazers.jpeg";
import palazzosImg from "../assets/categories/Palazzo.jpeg";
import topsImg from "../assets/categories/Tops.jpeg";
import chalecosImg from "../assets/categories/chalecos.jpeg";

export const categories = [
  {
    id: 1,
    slug: "sets",
    name: "Sets",
    categoriaApi: "Sets",
    aliases: ["conjuntos", "conjunto", "set", "coordinados", "coordinado"],
    image: conjuntosImg,
    href: "/catalogo/conjuntos",
  },
  {
    id: 2,
    slug: "vestidos",
    name: "Vestidos",
    categoriaApi: "Vestidos",
    aliases: ["vestido"],
    image: vestidosImg,
    href: "/catalogo/vestidos",
  },
  {
    id: 3,
    slug: "chamarras",
    name: "Chamarras",
    categoriaApi: "Chamarras",
    aliases: ["chamarra"],
    image: chamarrasImg,
    href: "/catalogo/chamarras",
  },
  {
    id: 4,
    slug: "faldas",
    name: "Faldas",
    categoriaApi: "Faldas",
    aliases: ["falda"],
    image: faldasImg,
    href: "/catalogo/faldas",
  },
  {
    id: 5,
    slug: "shorts",
    name: "Shorts",
    categoriaApi: "Shorts",
    aliases: ["short"],
    image: shortsImg,
    href: "/catalogo/shorts",
  },
  {
    id: 6,
    slug: "blusas",
    name: "Blusas",
    categoriaApi: "Blusas",
    aliases: ["blusa"],
    image: blusasImg,
    href: "/catalogo/blusas",
  },
  {
    id: 7,
    slug: "sacos",
    name: "Sacos",
    categoriaApi: "Sacos",
    aliases: ["saco"],
    image: sacosImg,
    href: "/catalogo/sacos",
  },
  {
    id: 8,
    slug: "pantalones",
    name: "Pantalones",
    categoriaApi: "Pantalones",
    aliases: ["pantalon", "pantalón"],
    image: pantalonesImg,
    href: "/catalogo/pantalones",
  },
  {
    id: 9,
    slug: "blazers",
    name: "Blazers",
    categoriaApi: "Blazers",
    aliases: ["blazer"],
    image: blazersImg,
    href: "/catalogo/blazers",
  },
  {
    id: 10,
    slug: "palazzos",
    name: "Palazzos",
    categoriaApi: "Palazzos",
    aliases: ["palazzo"],
    image: palazzosImg,
    href: "/catalogo/palazzos",
  },
  {
    id: 11,
    slug: "chalecos",
    name: "Chalecos",
    categoriaApi: "Chalecos",
    aliases: ["chaleco"],
    image: chalecosImg,
    href: "/catalogo/chalecos",
  },
  {
    id: 12,
    slug: "tops",
    name: "Tops",
    categoriaApi: "Tops",
    aliases: ["top"],
    image: topsImg,
    href: "/catalogo/tops",
  },
];
