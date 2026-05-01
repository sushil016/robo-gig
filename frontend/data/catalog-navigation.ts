export type CatalogSubcategory = {
  name: string;
  href: string;
};

export type CatalogNavigationGroup = {
  name: string;
  href: string;
  description: string;
  subcategories: CatalogSubcategory[];
};

export const catalogNavigationGroups: CatalogNavigationGroup[] = [
  {
    name: "Semiconductors",
    href: "/components?category=Semiconductors",
    description: "ICs, drivers, regulators, transistors, and logic parts.",
    subcategories: [
      { name: "Motor Driver ICs & Modules", href: "/components?category=Semiconductors&subcategory=Motor%20Driver%20ICs%20%26%20Modules" },
      { name: "Voltage Regulators", href: "/components?category=Semiconductors&subcategory=Voltage%20Regulators" },
      { name: "Logic ICs", href: "/components?category=Semiconductors&subcategory=Logic%20ICs" },
      { name: "Transistors & MOSFETs", href: "/components?category=Semiconductors&subcategory=Transistors%20%26%20MOSFETs" },
    ],
  },
  {
    name: "Sensors",
    href: "/components?category=Sensors",
    description: "Distance, motion, environment, vision, and industrial sensors.",
    subcategories: [
      { name: "Distance Sensors", href: "/components?category=Sensors&subcategory=Distance%20Sensors" },
      { name: "Motion Sensors", href: "/components?category=Sensors&subcategory=Motion%20Sensors" },
      { name: "Environment Sensors", href: "/components?category=Sensors&subcategory=Environment%20Sensors" },
      { name: "Camera & Vision Sensors", href: "/components?category=Sensors&subcategory=Camera%20%26%20Vision%20Sensors" },
    ],
  },
  {
    name: "Development Boards",
    href: "/components?category=Development%20Boards",
    description: "Arduino, ESP32, Raspberry Pi, STM32, and controller boards.",
    subcategories: [
      { name: "Arduino Boards", href: "/components?category=Development%20Boards&subcategory=Arduino%20Boards" },
      { name: "WiFi & Bluetooth Boards", href: "/components?category=Development%20Boards&subcategory=WiFi%20%26%20Bluetooth%20Boards" },
      { name: "Single Board Computers", href: "/components?category=Development%20Boards&subcategory=Single%20Board%20Computers" },
      { name: "STM32 & ARM Boards", href: "/components?category=Development%20Boards&subcategory=STM32%20%26%20ARM%20Boards" },
    ],
  },
  {
    name: "Motors & Actuators",
    href: "/components?category=Motors%20%26%20Actuators",
    description: "Movement parts for robots, drones, machines, and models.",
    subcategories: [
      { name: "DC Motors", href: "/components?category=Motors%20%26%20Actuators&subcategory=DC%20Motors" },
      { name: "Servo Motors", href: "/components?category=Motors%20%26%20Actuators&subcategory=Servo%20Motors" },
      { name: "Stepper Motors", href: "/components?category=Motors%20%26%20Actuators&subcategory=Stepper%20Motors" },
      { name: "Motor Drivers", href: "/components?category=Motors%20%26%20Actuators&subcategory=Motor%20Drivers" },
    ],
  },
  {
    name: "Power & Batteries",
    href: "/components?category=Power%20%26%20Batteries",
    description: "Battery packs, BMS boards, chargers, and power modules.",
    subcategories: [
      { name: "Battery Packs", href: "/components?category=Power%20%26%20Batteries&subcategory=Battery%20Packs" },
      { name: "BMS Boards", href: "/components?category=Power%20%26%20Batteries&subcategory=BMS%20Boards" },
      { name: "Chargers", href: "/components?category=Power%20%26%20Batteries&subcategory=Chargers" },
      { name: "Power Modules", href: "/components?category=Power%20%26%20Batteries&subcategory=Power%20Modules" },
    ],
  },
  {
    name: "Drones & Aerospace",
    href: "/components?category=Drones%20%26%20Aerospace",
    description: "UAV, satellite model, payload, and aero modeling parts.",
    subcategories: [
      { name: "Flight Controllers", href: "/components?category=Drones%20%26%20Aerospace&subcategory=Flight%20Controllers" },
      { name: "Aero Modeling Kits", href: "/components?category=Drones%20%26%20Aerospace&subcategory=Aero%20Modeling%20Kits" },
      { name: "Propulsion", href: "/components?category=Drones%20%26%20Aerospace&subcategory=Propulsion" },
      { name: "Telemetry & Payloads", href: "/components?category=Drones%20%26%20Aerospace&subcategory=Telemetry%20%26%20Payloads" },
    ],
  },
  {
    name: "Robomaniac Store",
    href: "/robomaniac-store",
    description: "Course kits, books, Lego robotics, and BlockSquare software.",
    subcategories: [
      { name: "Robotics Course Kits", href: "/robomaniac-store?subcategory=Robotics%20Course%20Kits" },
      { name: "Lego Robotics Course Kits", href: "/robomaniac-store?subcategory=Lego%20Robotics%20Course%20Kits" },
      { name: "Robotics & AI Books", href: "/robomaniac-store?subcategory=Robotics%20%26%20AI%20Books" },
      { name: "BlockSquare Software", href: "/robomaniac-store?subcategory=Software" },
    ],
  },
  {
    name: "Tools & Prototyping",
    href: "/components?category=Tools%20%26%20Prototyping",
    description: "Breadboards, wires, connectors, test tools, and lab equipment.",
    subcategories: [
      { name: "Breadboards", href: "/components?category=Tools%20%26%20Prototyping&subcategory=Breadboards" },
      { name: "Wires & Connectors", href: "/components?category=Tools%20%26%20Prototyping&subcategory=Wires%20%26%20Connectors" },
      { name: "Test & Measurement", href: "/components?category=Test%20%26%20Measurement" },
      { name: "Soldering Tools", href: "/components?category=Tools%20%26%20Prototyping&subcategory=Soldering%20Tools" },
    ],
  },
];
