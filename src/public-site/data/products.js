// src/data/products.js
import p1 from "../assets/products/p1.png";
import p1_p1 from "../assets/products/p1_p1.png";
import p2 from "../assets/products/p2.png";
import p2_p2 from "../assets/products/p2_p2.png";
import p3 from "../assets/products/p3.png";
import p3_p3 from "../assets/products/p3_p3.png";
import p4 from "../assets/products/p4.png";
import p5 from "../assets/products/p5.png";
import p6 from "../assets/products/p6.png";
import p6_p1 from "../assets/products/p6_p1.png";
import p6_p2 from "../assets/products/p6_p2.png";

export const products = [
  {
    id: "p-001",
    name: "Blusa popelina flores 3d",
    price: 799,
    badge: "NUEVO",
    description: "Blusa cómoda en tela, ideal para outfit casual o de noche.",
    images: [p1, p1_p1],
    colors: [{ name: "Azul", hex: "#1d4ed8" }],
    sizes: ["CH", "M", "G"],
  },

  {
    id: "p-002",
    name: "Blusa de punto bicolor",
    price: 799,
    badge: "NUEVO",
    description: "Blusa cómoda en algodón, ideal para uso diario.",
    images: [p2, p2_p2],
    colors: [
      { name: "Negro", hex: "#111827" },
      { name: "Blanco", hex: "#ffffff" },
    ],
    sizes: ["CH", "M", "G"],
  },

  {
    id: "p-003",
    name: "Vestido corto rayas rojo",
    price: 1399,
    badge: "NUEVO",
    description: "Vestido ideal para ocasiones especiales.",
    images: [p3, p3_p3],
    colors: [{ name: "Rosa", hex: "#ec4899" }],
    sizes: ["CH", "M", "G"],
  },

  {
    id: "p-004",
    name: "Blusa popelina blanco bordado",
    price: 799,
    badge: "NUEVO",
    description: "Set fresco ideal para verano.",
    images: [p4],
    colors: [{ name: "Blanco", hex: "#ffffff" }],
    sizes: ["CH", "M", "G"],
  },

  {
    id: "p-005",
    name: "Blusa tipo chaleco amarillo",
    price: 850,
    badge: "NUEVO",
    description: "Blusa cómoda en algodón, ideal para uso diario.",
    images: [p5],
    colors: [{ name: "Beige", hex: "#f5f5dc" }],
    sizes: ["CH", "M", "G"],
  },

  {
    id: "p-006",
    name: "set blusa y falda bicolor rayas",
    price: 1499,
    badge: "NUEVO",
    description: "Set cómodo de blusa y falda con rayas bicolor.",
    images: [p6, p6_p1, p6_p2],
    colors: [{ name: "Café", hex: "#6b4f2a" }],
    sizes: ["CH", "M", "G"],
  },
];
