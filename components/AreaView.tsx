import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Frequency } from '../types';
import AIChatModal from './AIChatModal';
import Modal from './Modal';
import { suggestMoreTasks } from '../services/geminiService';

interface AreaViewProps {
  areaId: string;
  onBack: () => void;
}

const TASK_SUGGESTIONS: Record<string, { title: string, freq: Frequency }[]> = {
  'Cocina': [
    { title: 'Fregar los platos', freq: Frequency.DAILY },
    { title: 'Limpiar las encimeras', freq: Frequency.DAILY },
    { title: 'Barrer el suelo', freq: Frequency.DAILY },
    { title: 'Sacar la basura', freq: Frequency.DAILY },
    { title: 'Limpiar la mesa del comedor', freq: Frequency.DAILY },
    { title: 'Limpiar el fregadero', freq: Frequency.DAILY },
    { title: 'Fregar el suelo', freq: Frequency.WEEKLY },
    { title: 'Limpiar el microondas', freq: Frequency.WEEKLY },
    { title: 'Limpiar la estufa', freq: Frequency.WEEKLY },
    { title: 'Cambiar los trapos de cocina', freq: Frequency.WEEKLY },
    { title: 'Limpiar el exterior de los electrodomésticos', freq: Frequency.WEEKLY },
    { title: 'Desinfectar el cubo de basura', freq: Frequency.WEEKLY },
    { title: 'Limpiar la cafetera', freq: Frequency.WEEKLY },
    { title: 'Revisar la comida caducada', freq: Frequency.WEEKLY },
    { title: 'Limpiar el interior del horno', freq: Frequency.MONTHLY },
    { title: 'Limpiar el interior del refrigerador', freq: Frequency.MONTHLY },
    { title: 'Limpiar los azulejos de la pared', freq: Frequency.MONTHLY },
    { title: 'Limpiar los armarios por fuera', freq: Frequency.MONTHLY },
    { title: 'Limpiar la campana extractora', freq: Frequency.MONTHLY },
    { title: 'Descalcificar el hervidor de agua', freq: Frequency.MONTHLY },
    { title: 'Limpiar el filtro del lavavajillas', freq: Frequency.MONTHLY },
    { title: 'Limpiar los rodapiés', freq: Frequency.MONTHLY },
    { title: 'Limpiar las ventanas por dentro', freq: Frequency.MONTHLY },
    { title: 'Limpiar detrás del refrigerador', freq: Frequency.QUARTERLY },
    { title: 'Limpiar debajo del horno', freq: Frequency.QUARTERLY },
    { title: 'Organizar la despensa a fondo', freq: Frequency.QUARTERLY },
    { title: 'Limpiar los armarios por dentro', freq: Frequency.QUARTERLY },
    { title: 'Descongelar el congelador', freq: Frequency.QUARTERLY },
    { title: 'Lavar las cortinas de la cocina', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las lámparas de techo', freq: Frequency.QUARTERLY },
  ],
  'Sala de Estar': [
    { title: 'Recoger objetos desordenados', freq: Frequency.DAILY },
    { title: 'Ahuecar los cojines', freq: Frequency.DAILY },
    { title: 'Doblar las mantas', freq: Frequency.DAILY },
    { title: 'Limpiar la mesa de centro', freq: Frequency.DAILY },
    { title: 'Barrer o aspirar el suelo', freq: Frequency.WEEKLY },
    { title: 'Fregar el suelo', freq: Frequency.WEEKLY },
    { title: 'Quitar el polvo de los muebles', freq: Frequency.WEEKLY },
    { title: 'Limpiar la pantalla del televisor', freq: Frequency.WEEKLY },
    { title: 'Regar las plantas de interior', freq: Frequency.WEEKLY },
    { title: 'Desinfectar los mandos a distancia', freq: Frequency.WEEKLY },
    { title: 'Aspirar el sofá', freq: Frequency.BIWEEKLY },
    { title: 'Quitar el polvo de los estantes', freq: Frequency.BIWEEKLY },
    { title: 'Limpiar los espejos', freq: Frequency.BIWEEKLY },
    { title: 'Quitar el polvo de los cuadros', freq: Frequency.BIWEEKLY },
    { title: 'Limpiar las ventanas por dentro', freq: Frequency.MONTHLY },
    { title: 'Lavar las fundas de los cojines', freq: Frequency.MONTHLY },
    { title: 'Limpiar los rodapiés', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo del ventilador de techo', freq: Frequency.MONTHLY },
    { title: 'Limpiar las puertas y pomos', freq: Frequency.MONTHLY },
    { title: 'Aspirar debajo de los muebles', freq: Frequency.MONTHLY },
    { title: 'Limpiar las pantallas de las lámparas', freq: Frequency.MONTHLY },
    { title: 'Organizar los cables visibles', freq: Frequency.MONTHLY },
    { title: 'Limpiar los interruptores de luz', freq: Frequency.MONTHLY },
    { title: 'Lavar las cortinas', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las alfombras a fondo', freq: Frequency.QUARTERLY },
    { title: 'Pulir los muebles de madera', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las rejillas de ventilación', freq: Frequency.QUARTERLY },
    { title: 'Limpiar la tapicería del sofá', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las lámparas de techo', freq: Frequency.QUARTERLY },
    { title: 'Limpiar la chimenea (si aplica)', freq: Frequency.QUARTERLY },
  ],
  'Dormitorio': [
    { title: 'Hacer la cama', freq: Frequency.DAILY },
    { title: 'Recoger la ropa del suelo', freq: Frequency.DAILY },
    { title: 'Guardar la ropa limpia', freq: Frequency.DAILY },
    { title: 'Despejar las mesitas de noche', freq: Frequency.DAILY },
    { title: 'Cambiar las sábanas', freq: Frequency.WEEKLY },
    { title: 'Barrer o aspirar el suelo', freq: Frequency.WEEKLY },
    { title: 'Fregar el suelo', freq: Frequency.WEEKLY },
    { title: 'Quitar el polvo de los muebles', freq: Frequency.WEEKLY },
    { title: 'Vaciar la papelera', freq: Frequency.WEEKLY },
    { title: 'Limpiar los espejos', freq: Frequency.WEEKLY },
    { title: 'Ordenar los zapatos', freq: Frequency.WEEKLY },
    { title: 'Desinfectar los pomos de las puertas', freq: Frequency.WEEKLY },
    { title: 'Aspirar debajo de la cama', freq: Frequency.BIWEEKLY },
    { title: 'Quitar el polvo de la decoración', freq: Frequency.BIWEEKLY },
    { title: 'Lavar la funda del edredón', freq: Frequency.MONTHLY },
    { title: 'Lavar las almohadas', freq: Frequency.MONTHLY },
    { title: 'Limpiar las ventanas por dentro', freq: Frequency.MONTHLY },
    { title: 'Limpiar los rodapiés', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo de las persianas', freq: Frequency.MONTHLY },
    { title: 'Limpiar las puertas del armario', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo del ventilador de techo', freq: Frequency.MONTHLY },
    { title: 'Limpiar los interruptores de luz', freq: Frequency.MONTHLY },
    { title: 'Ordenar el interior del armario', freq: Frequency.QUARTERLY },
    { title: 'Darle la vuelta al colchón', freq: Frequency.QUARTERLY },
    { title: 'Lavar las mantas pesadas', freq: Frequency.QUARTERLY },
    { title: 'Lavar las cortinas', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las alfombras a fondo', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las rejillas de ventilación', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las lámparas de techo', freq: Frequency.QUARTERLY },
    { title: 'Donar ropa que ya no se usa', freq: Frequency.QUARTERLY },
  ],
  'Baño': [
    { title: 'Limpiar el lavabo', freq: Frequency.DAILY },
    { title: 'Limpiar las encimeras', freq: Frequency.DAILY },
    { title: 'Colgar las toallas mojadas', freq: Frequency.DAILY },
    { title: 'Limpiar el inodoro por dentro y por fuera', freq: Frequency.WEEKLY },
    { title: 'Limpiar la ducha o bañera', freq: Frequency.WEEKLY },
    { title: 'Limpiar el espejo', freq: Frequency.WEEKLY },
    { title: 'Fregar el suelo', freq: Frequency.WEEKLY },
    { title: 'Cambiar las toallas', freq: Frequency.WEEKLY },
    { title: 'Vaciar la papelera', freq: Frequency.WEEKLY },
    { title: 'Lavar la alfombrilla del baño', freq: Frequency.WEEKLY },
    { title: 'Desinfectar los pomos y grifos', freq: Frequency.WEEKLY },
    { title: 'Reponer el papel higiénico y jabón', freq: Frequency.WEEKLY },
    { title: 'Limpiar el portacepillos de dientes', freq: Frequency.BIWEEKLY },
    { title: 'Desinfectar el cubo de basura', freq: Frequency.BIWEEKLY },
    { title: 'Limpiar los azulejos de la ducha', freq: Frequency.MONTHLY },
    { title: 'Descalcificar el cabezal de la ducha', freq: Frequency.MONTHLY },
    { title: 'Lavar la cortina de la ducha', freq: Frequency.MONTHLY },
    { title: 'Limpiar el extractor de aire', freq: Frequency.MONTHLY },
    { title: 'Limpiar los armarios por fuera', freq: Frequency.MONTHLY },
    { title: 'Limpiar los rodapiés', freq: Frequency.MONTHLY },
    { title: 'Limpiar las ventanas por dentro', freq: Frequency.MONTHLY },
    { title: 'Limpiar la puerta por ambos lados', freq: Frequency.MONTHLY },
    { title: 'Organizar los cajones del baño', freq: Frequency.QUARTERLY },
    { title: 'Desechar cosméticos caducados', freq: Frequency.QUARTERLY },
    { title: 'Desechar medicamentos caducados', freq: Frequency.QUARTERLY },
    { title: 'Destapar y limpiar los desagües', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las lámparas', freq: Frequency.QUARTERLY },
    { title: 'Lavar el forro de plástico de la ducha', freq: Frequency.QUARTERLY },
    { title: 'Limpiar la báscula', freq: Frequency.QUARTERLY },
    { title: 'Limpiar a fondo las juntas de los azulejos', freq: Frequency.QUARTERLY },
  ],
  'Oficina': [
    { title: 'Despejar el escritorio', freq: Frequency.DAILY },
    { title: 'Tirar papeles innecesarios', freq: Frequency.DAILY },
    { title: 'Vaciar la papelera', freq: Frequency.DAILY },
    { title: 'Organizar los bolígrafos y material', freq: Frequency.DAILY },
    { title: 'Quitar el polvo del escritorio', freq: Frequency.WEEKLY },
    { title: 'Aspirar o barrer el suelo', freq: Frequency.WEEKLY },
    { title: 'Fregar el suelo', freq: Frequency.WEEKLY },
    { title: 'Limpiar la pantalla del ordenador', freq: Frequency.WEEKLY },
    { title: 'Limpiar el teclado', freq: Frequency.WEEKLY },
    { title: 'Desinfectar el ratón', freq: Frequency.WEEKLY },
    { title: 'Regar las plantas de la oficina', freq: Frequency.WEEKLY },
    { title: 'Vaciar la papelera de reciclaje', freq: Frequency.WEEKLY },
    { title: 'Quitar el polvo de las estanterías', freq: Frequency.BIWEEKLY },
    { title: 'Limpiar los marcos de fotos', freq: Frequency.BIWEEKLY },
    { title: 'Destruir documentos confidenciales', freq: Frequency.MONTHLY },
    { title: 'Limpiar las ventanas por dentro', freq: Frequency.MONTHLY },
    { title: 'Limpiar los rodapiés', freq: Frequency.MONTHLY },
    { title: 'Organizar los cables del ordenador', freq: Frequency.MONTHLY },
    { title: 'Limpiar la silla de oficina', freq: Frequency.MONTHLY },
    { title: 'Limpiar la puerta y el pomo', freq: Frequency.MONTHLY },
    { title: 'Limpiar la pizarra o corcho', freq: Frequency.MONTHLY },
    { title: 'Limpiar el exterior de la impresora', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo de las persianas', freq: Frequency.MONTHLY },
    { title: 'Hacer copia de seguridad de archivos', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las lámparas', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las rejillas de ventilación', freq: Frequency.QUARTERLY },
    { title: 'Organizar los cajones del escritorio a fondo', freq: Frequency.QUARTERLY },
    { title: 'Quitar el polvo de los libros', freq: Frequency.QUARTERLY },
    { title: 'Lavar las cortinas', freq: Frequency.QUARTERLY },
    { title: 'Limpiar la alfombra a fondo', freq: Frequency.QUARTERLY },
  ],
  'Entrada': [
    { title: 'Ordenar los zapatos', freq: Frequency.DAILY },
    { title: 'Colgar los abrigos', freq: Frequency.DAILY },
    { title: 'Dejar las llaves en su sitio', freq: Frequency.DAILY },
    { title: 'Recoger el correo', freq: Frequency.DAILY },
    { title: 'Barrer el suelo', freq: Frequency.WEEKLY },
    { title: 'Fregar el suelo', freq: Frequency.WEEKLY },
    { title: 'Sacudir el felpudo exterior', freq: Frequency.WEEKLY },
    { title: 'Aspirar la alfombra de entrada', freq: Frequency.WEEKLY },
    { title: 'Quitar el polvo de la consola o mueble', freq: Frequency.WEEKLY },
    { title: 'Limpiar el espejo de la entrada', freq: Frequency.WEEKLY },
    { title: 'Desinfectar el pomo de la puerta principal', freq: Frequency.WEEKLY },
    { title: 'Desinfectar los interruptores', freq: Frequency.WEEKLY },
    { title: 'Limpiar el zapatero', freq: Frequency.BIWEEKLY },
    { title: 'Quitar el polvo de los adornos', freq: Frequency.BIWEEKLY },
    { title: 'Limpiar la puerta principal por dentro y fuera', freq: Frequency.MONTHLY },
    { title: 'Limpiar los rodapiés', freq: Frequency.MONTHLY },
    { title: 'Limpiar las lámparas de la entrada', freq: Frequency.MONTHLY },
    { title: 'Limpiar las ventanas cercanas', freq: Frequency.MONTHLY },
    { title: 'Limpiar el buzón', freq: Frequency.MONTHLY },
    { title: 'Barrer el porche o rellano', freq: Frequency.MONTHLY },
    { title: 'Limpiar el timbre', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo de las persianas', freq: Frequency.MONTHLY },
    { title: 'Lavar las cortinas', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las rejillas de ventilación', freq: Frequency.QUARTERLY },
    { title: 'Lavar la alfombra de entrada a fondo', freq: Frequency.QUARTERLY },
    { title: 'Quitar el polvo del techo y esquinas', freq: Frequency.QUARTERLY },
    { title: 'Organizar el armario de los abrigos', freq: Frequency.QUARTERLY },
    { title: 'Guardar ropa de otra temporada', freq: Frequency.QUARTERLY },
    { title: 'Limpiar a fondo el felpudo exterior', freq: Frequency.QUARTERLY },
    { title: 'Pulir los muebles de la entrada', freq: Frequency.QUARTERLY },
  ],
  'Entretenimiento': [
    { title: 'Recoger mandos y accesorios', freq: Frequency.DAILY },
    { title: 'Doblar las mantas del sofá', freq: Frequency.DAILY },
    { title: 'Ordenar los videojuegos o películas', freq: Frequency.DAILY },
    { title: 'Quitar el polvo del televisor', freq: Frequency.WEEKLY },
    { title: 'Aspirar o barrer el suelo', freq: Frequency.WEEKLY },
    { title: 'Fregar el suelo', freq: Frequency.WEEKLY },
    { title: 'Desinfectar los mandos de las consolas', freq: Frequency.WEEKLY },
    { title: 'Quitar el polvo de las consolas', freq: Frequency.WEEKLY },
    { title: 'Limpiar los altavoces', freq: Frequency.WEEKLY },
    { title: 'Vaciar la papelera', freq: Frequency.WEEKLY },
    { title: 'Limpiar la mesa de centro', freq: Frequency.WEEKLY },
    { title: 'Desinfectar los pomos de las puertas', freq: Frequency.WEEKLY },
    { title: 'Quitar el polvo de las estanterías', freq: Frequency.BIWEEKLY },
    { title: 'Aspirar el sofá y los sillones', freq: Frequency.BIWEEKLY },
    { title: 'Organizar los cables de los equipos', freq: Frequency.MONTHLY },
    { title: 'Limpiar las ventanas por dentro', freq: Frequency.MONTHLY },
    { title: 'Limpiar los rodapiés', freq: Frequency.MONTHLY },
    { title: 'Limpiar las puertas', freq: Frequency.MONTHLY },
    { title: 'Lavar las fundas de los cojines', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo del ventilador de techo', freq: Frequency.MONTHLY },
    { title: 'Limpiar las pantallas de las lámparas', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo de las persianas', freq: Frequency.MONTHLY },
    { title: 'Limpiar los interruptores de luz', freq: Frequency.MONTHLY },
    { title: 'Limpiar las lámparas de techo', freq: Frequency.QUARTERLY },
    { title: 'Lavar las cortinas', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las rejillas de ventilación', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las alfombras a fondo', freq: Frequency.QUARTERLY },
    { title: 'Pulir los muebles de madera', freq: Frequency.QUARTERLY },
    { title: 'Revisar y organizar juegos antiguos', freq: Frequency.QUARTERLY },
    { title: 'Limpiar a fondo la tapicería', freq: Frequency.QUARTERLY },
  ],
  'Almacenamiento': [
    { title: 'Mantener el pasillo despejado', freq: Frequency.WEEKLY },
    { title: 'Barrer el suelo', freq: Frequency.WEEKLY },
    { title: 'Vaciar la papelera', freq: Frequency.WEEKLY },
    { title: 'Ordenar las herramientas usadas', freq: Frequency.WEEKLY },
    { title: 'Fregar el suelo', freq: Frequency.BIWEEKLY },
    { title: 'Aspirar el suelo', freq: Frequency.BIWEEKLY },
    { title: 'Organizar las cajas apiladas', freq: Frequency.MONTHLY },
    { title: 'Revisar si hay plagas o insectos', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo de las estanterías', freq: Frequency.MONTHLY },
    { title: 'Limpiar las telarañas del techo', freq: Frequency.MONTHLY },
    { title: 'Limpiar los rodapiés', freq: Frequency.MONTHLY },
    { title: 'Limpiar la puerta por ambos lados', freq: Frequency.MONTHLY },
    { title: 'Desinfectar el pomo de la puerta', freq: Frequency.MONTHLY },
    { title: 'Limpiar las ventanas (si las hay)', freq: Frequency.MONTHLY },
    { title: 'Revisar si hay problemas de humedad', freq: Frequency.MONTHLY },
    { title: 'Limpiar el exterior de los armarios', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo de los artículos grandes', freq: Frequency.MONTHLY },
    { title: 'Limpiar los interruptores de luz', freq: Frequency.MONTHLY },
    { title: 'Donar artículos que ya no se usan', freq: Frequency.QUARTERLY },
    { title: 'Etiquetar las cajas de almacenamiento', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las lámparas', freq: Frequency.QUARTERLY },
    { title: 'Revisar las fechas de caducidad (si hay comida)', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las rejillas de ventilación', freq: Frequency.QUARTERLY },
    { title: 'Organizar los artículos de temporada', freq: Frequency.QUARTERLY },
    { title: 'Organizar el equipaje y maletas', freq: Frequency.QUARTERLY },
    { title: 'Limpiar los tapetes o alfombras', freq: Frequency.QUARTERLY },
    { title: 'Organizar el equipo deportivo', freq: Frequency.QUARTERLY },
    { title: 'Hacer inventario de lo guardado', freq: Frequency.QUARTERLY },
    { title: 'Limpiar a fondo las estanterías vacías', freq: Frequency.QUARTERLY },
    { title: 'Desechar objetos rotos o inútiles', freq: Frequency.QUARTERLY },
  ],
  'default': [
    { title: 'Recoger el desorden general', freq: Frequency.DAILY },
    { title: 'Vaciar la papelera', freq: Frequency.DAILY },
    { title: 'Limpiar las superficies principales', freq: Frequency.DAILY },
    { title: 'Barrer o aspirar el suelo', freq: Frequency.WEEKLY },
    { title: 'Fregar el suelo', freq: Frequency.WEEKLY },
    { title: 'Quitar el polvo de los muebles', freq: Frequency.WEEKLY },
    { title: 'Desinfectar los pomos de las puertas', freq: Frequency.WEEKLY },
    { title: 'Desinfectar los interruptores de luz', freq: Frequency.WEEKLY },
    { title: 'Regar las plantas', freq: Frequency.WEEKLY },
    { title: 'Limpiar los espejos', freq: Frequency.WEEKLY },
    { title: 'Limpiar las mesas de cristal', freq: Frequency.WEEKLY },
    { title: 'Quitar el polvo de los adornos', freq: Frequency.BIWEEKLY },
    { title: 'Aspirar las alfombras', freq: Frequency.BIWEEKLY },
    { title: 'Lavar el cubo de basura', freq: Frequency.BIWEEKLY },
    { title: 'Limpiar los rodapiés', freq: Frequency.MONTHLY },
    { title: 'Limpiar las ventanas por dentro', freq: Frequency.MONTHLY },
    { title: 'Limpiar las puertas', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo de las persianas', freq: Frequency.MONTHLY },
    { title: 'Quitar el polvo del ventilador de techo', freq: Frequency.MONTHLY },
    { title: 'Limpiar las pantallas de las lámparas', freq: Frequency.MONTHLY },
    { title: 'Quitar las telarañas de las esquinas', freq: Frequency.MONTHLY },
    { title: 'Revisar los detectores de humo', freq: Frequency.MONTHLY },
    { title: 'Organizar los cajones desordenados', freq: Frequency.MONTHLY },
    { title: 'Limpiar las lámparas de techo', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las rejillas de ventilación', freq: Frequency.QUARTERLY },
    { title: 'Lavar las cortinas', freq: Frequency.QUARTERLY },
    { title: 'Limpiar las alfombras a fondo', freq: Frequency.QUARTERLY },
    { title: 'Pulir los muebles de madera', freq: Frequency.QUARTERLY },
    { title: 'Reemplazar los filtros de aire', freq: Frequency.QUARTERLY },
    { title: 'Donar o desechar cosas sin uso', freq: Frequency.QUARTERLY },
  ]
};

const formatCamelCase = (str: string) => {
  if (!str) return str;
  if (str.includes(' ')) return str.charAt(0).toUpperCase() + str.slice(1);
  const result = str.replace(/([A-Z])/g, " $1").trim();
  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
};

const AreaView: React.FC<AreaViewProps> = ({ areaId, onBack }) => {
  const { state, getTasksByArea, completeTask, addTask, addTasks, deleteTask, assignTask, updateArea, deleteArea, t, language } = useApp();
  const area = state.areas.find(a => a.id === areaId);
  const tasks = getTasksByArea(areaId);
  
  const [showAI, setShowAI] = useState(false);
  const [selectedTaskForAI, setSelectedTaskForAI] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Custom task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskFreq, setNewTaskFreq] = useState<Frequency>(Frequency.WEEKLY);
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('');

  // Suggestions state
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  
  // Edit Area state
  const [isEditAreaModalOpen, setIsEditAreaModalOpen] = useState(false);
  const [editAreaName, setEditAreaName] = useState('');

  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [dynamicSuggestions, setDynamicSuggestions] = useState<{ title: string, freq: Frequency }[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const apartment = state.apartments.find(a => a.id === area.apartmentId);
  const houseCleaningFreq = apartment?.cleaningFrequency || Frequency.WEEKLY;

  const getBaseSuggestions = () => {
    const name = area?.name || '';
    if (TASK_SUGGESTIONS[name]) return TASK_SUGGESTIONS[name];
    
    // Backward compatibility for old English names
    const oldNameMap: Record<string, string> = {
      'kitchen': 'Cocina',
      'Kitchen': 'Cocina',
      'livingRoom': 'Sala de Estar',
      'Living Room': 'Sala de Estar',
      'bedroom': 'Dormitorio',
      'Bedroom': 'Dormitorio',
      'bathroom': 'Baño',
      'Bathroom': 'Baño',
      'office': 'Oficina',
      'Office': 'Oficina',
      'entrance': 'Entrada',
      'Entrance': 'Entrada',
      'entertainment': 'Entretenimiento',
      'Entertainment': 'Entretenimiento',
      'storage': 'Almacenamiento',
      'Storage': 'Almacenamiento'
    };
    
    if (oldNameMap[name] && TASK_SUGGESTIONS[oldNameMap[name]]) {
      return TASK_SUGGESTIONS[oldNameMap[name]];
    }
    
    return TASK_SUGGESTIONS['default'];
  };

  const baseSuggestions = getBaseSuggestions();
  const allSuggestions = [...baseSuggestions, ...dynamicSuggestions];
  
  const freqOrder: Record<Frequency, number> = {
    [Frequency.DAILY]: 1,
    [Frequency.WEEKLY]: 2,
    [Frequency.BIWEEKLY]: 3,
    [Frequency.MONTHLY]: 4,
    [Frequency.QUARTERLY]: 5
  };

  // Filter out tasks that are already added to the area and filter by frequency
  const existingTaskTitles = tasks.map(t => t.title.toLowerCase());
  const availableSuggestions = allSuggestions.filter(s => {
    const translatedTitle = t(s.title as any) || s.title;
    const notExists = !existingTaskTitles.includes(s.title.toLowerCase()) && !existingTaskTitles.includes(translatedTitle.toLowerCase());
    const freqAllowed = freqOrder[s.freq] >= freqOrder[houseCleaningFreq];
    return notExists && freqAllowed;
  });

  const handleSuggestMore = async () => {
    setIsSuggesting(true);
    try {
      const excludeList = [
          ...tasks.map(t => t.title),
          ...availableSuggestions.map(s => s.title)
      ];
      const newSuggestions = await suggestMoreTasks(t(area?.name as any) || area?.name || 'Area', excludeList, language, houseCleaningFreq);
      setDynamicSuggestions(prev => [...prev, ...newSuggestions]);
    } catch (error: any) {
      alert(error.message || t('failedToFetchAdvice'));
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tasksToAdd: Task[] = [];
    const now = new Date().toISOString();

    // Add selected suggestions
    selectedSuggestions.forEach(title => {
      const suggestion = allSuggestions.find(s => s.title === title);
      if (suggestion) {
        tasksToAdd.push({
          id: `local-task-${Date.now()}-${Math.random()}`,
          title: suggestion.title,
          frequency: suggestion.freq,
          areaId: areaId,
          lastCompletedDate: null,
          nextDueDate: now,
          assignedTo: newTaskAssignee || undefined
        });
      }
    });

    // Add custom task if provided
    if (newTaskTitle.trim()) {
      tasksToAdd.push({
        id: `local-task-${Date.now()}-custom`,
        title: newTaskTitle.trim(),
        frequency: newTaskFreq,
        areaId: areaId,
        lastCompletedDate: null,
        nextDueDate: now,
        assignedTo: newTaskAssignee || undefined
      });
    }

    if (tasksToAdd.length === 0) return;

    if (tasksToAdd.length === 1) {
      addTask(tasksToAdd[0]);
    } else {
      if (addTasks) {
        addTasks(tasksToAdd);
      }
    }

    setNewTaskTitle('');
    setNewTaskFreq(Frequency.WEEKLY);
    setNewTaskAssignee('');
    setSelectedSuggestions([]);
    setIsModalOpen(false);
  };

  const handleEditArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editAreaName.trim()) {
      const newName = editAreaName.trim();
      const finalName = newName === (t(area.name as any) || area.name) ? area.name : newName;
      await updateArea(areaId, finalName);
      setIsEditAreaModalOpen(false);
    }
  };

  const handleDeleteArea = async () => {
    if (window.confirm(t('areYouSureDeleteArea'))) {
      await deleteArea(areaId);
      onBack();
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteTaskModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete);
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
    }
  };

  if (!area) return <div>{t('areaNotFound')}</div>;

  const members = state.apartmentUsers.filter(au => au.apartmentId === area.apartmentId);
  const acceptedMembers = members.filter(m => m.status === 'accepted');
  const owner = state.profiles.find(p => p.id === apartment?.ownerId);
  
  const assignableUsers = [];
  if (owner) assignableUsers.push(owner);
  acceptedMembers.forEach(m => {
    const profile = state.profiles.find(p => p.id === m.userId);
    if (profile && profile.id !== owner?.id) assignableUsers.push(profile);
  });

  const handleComplete = (taskId: string) => {
    completeTask(taskId);
  };

  const handleAskAI = (taskTitle: string) => {
    setSelectedTaskForAI(taskTitle);
    setShowAI(true);
  };

  const handleAssignTask = async (taskId: string, userId: string) => {
    await assignTask(taskId, userId);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
     // Sort by due date ascending (overdue first)
     return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/90 backdrop-blur-sm py-4 z-10 border-b border-gray-200">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition">
            <i className="fa-solid fa-arrow-left text-gray-600"></i>
            </button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <i className={`fa-solid ${area.icon}`}></i>
                </div>
                <h2 className="text-xl font-bold text-gray-800">{t(area.name as any) || area.name} {t('tasks')}</h2>
                <button 
                  onClick={() => {
                    setEditAreaName(t(area.name as any) || area.name);
                    setIsEditAreaModalOpen(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition"
                  title={t('editArea')}
                >
                  <i className="fa-solid fa-pen text-sm"></i>
                </button>
                <button 
                  onClick={handleDeleteArea}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                  title={t('deleteArea')}
                >
                  <i className="fa-solid fa-trash text-sm"></i>
                </button>
            </div>
        </div>
        <button 
            onClick={() => {
              setSelectedSuggestions([]);
              setNewTaskTitle('');
              setIsModalOpen(true);
            }}
            className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full shadow-md hover:bg-sky-600 transition"
        >
            <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 && (
             <div className="py-12 text-center text-gray-400">
                 <p>{t('noTasksYet')}</p>
             </div>
        )}
        {sortedTasks.map(task => {
          const now = new Date();
          const dueDate = new Date(task.nextDueDate);
          const isDue = dueDate <= now;
          const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
          
          return (
            <div 
                key={task.id} 
                className={`
                    relative p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-4 transition-all
                    ${isDue ? 'bg-white border-orange-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-75'}
                `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800">{t(task.title as any) !== task.title ? t(task.title as any) : formatCamelCase(task.title)}</h4>
                    {isDue && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {daysOverdue > 0 ? `${t('overdue')} ${daysOverdue}d` : t('dueToday')}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                        <i className="fa-regular fa-clock"></i> {t(task.frequency.toLowerCase() as any) || task.frequency}
                    </span>
                    {task.lastCompletedDate && (
                         <span className="flex items-center gap-1 text-green-600">
                            <i className="fa-solid fa-check"></i> {t('lastCompleted')}: {new Date(task.lastCompletedDate).toLocaleDateString()}
                        </span>
                    )}
                    <div className="flex items-center gap-1 ml-auto sm:ml-0">
                        <i className="fa-solid fa-user"></i>
                        <select
                            value={task.assignedTo || ''}
                            onChange={(e) => handleAssignTask(task.id, e.target.value)}
                            className="bg-transparent border-none text-xs font-semibold text-gray-600 focus:ring-0 cursor-pointer"
                        >
                            <option value="">{t('unassigned')}</option>
                            {assignableUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.name || u.email}</option>
                            ))}
                        </select>
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end mt-3 sm:mt-0">
                <button
                    onClick={() => handleAskAI(task.title)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    title={t('getAIAdvice')}
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                </button>
                <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title={t('deleteTask')}
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
                
                {isDue ? (
                    <button
                        onClick={() => handleComplete(task.id)}
                        className="flex-1 sm:flex-none px-6 py-2 bg-secondary hover:bg-emerald-600 text-white font-bold rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-check"></i> {t('complete')}
                    </button>
                ) : (
                    <div className="text-xs font-semibold text-gray-400 bg-gray-200 px-3 py-1 rounded-md">
                        {t('due')} {dueDate.toLocaleDateString()}
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AIChatModal 
        isOpen={showAI} 
        onClose={() => setShowAI(false)} 
        taskTitle={t(selectedTaskForAI as any) !== selectedTaskForAI ? t(selectedTaskForAI as any) : formatCamelCase(selectedTaskForAI)} 
        areaName={t(area.name as any) || area.name} 
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addTasks')}>
        <form onSubmit={handleAddTasks} className="space-y-6">
            
            {/* Task Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">{t('suggestedTasks')}</label>
                <button 
                  type="button"
                  onClick={() => {
                    if (selectedSuggestions.length === availableSuggestions.length) {
                      setSelectedSuggestions([]);
                    } else {
                      setSelectedSuggestions(availableSuggestions.map(s => s.title));
                    }
                  }}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  {selectedSuggestions.length === availableSuggestions.length && availableSuggestions.length > 0 ? t('deselectAll') : t('selectAll')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {availableSuggestions.map(suggestion => (
                  <label 
                    key={suggestion.title}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                      ${selectedSuggestions.includes(suggestion.title) ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-gray-200 hover:border-primary/50'}
                    `}
                  >
                    <input 
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      checked={selectedSuggestions.includes(suggestion.title)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSuggestions(prev => [...prev, suggestion.title]);
                        } else {
                          setSelectedSuggestions(prev => prev.filter(t => t !== suggestion.title));
                        }
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">{t(suggestion.title as any) !== suggestion.title ? t(suggestion.title as any) : formatCamelCase(suggestion.title)}</span>
                      <span className="text-xs text-gray-500">{t(suggestion.freq.toLowerCase() as any) || suggestion.freq}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-3">
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleSuggestMore}
                    disabled={isSuggesting}
                    className="text-sm text-primary font-semibold hover:underline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSuggesting ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> {t('suggesting')}</>
                    ) : (
                      <><i className="fa-solid fa-wand-magic-sparkles"></i> {t('suggestMoreTasks')}</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addCustomTask')}</label>
                <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder={t('egDustFan')}
                />
            </div>
            {newTaskTitle.trim() && (
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('customTaskFrequency')}</label>
                  <select 
                      value={newTaskFreq}
                      onChange={e => setNewTaskFreq(e.target.value as Frequency)}
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                      {Object.values(Frequency).map(freq => (
                          <option key={freq} value={freq}>{t(freq.toLowerCase() as any) || freq}</option>
                      ))}
                  </select>
              </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('assignToOptional')}</label>
                <select 
                    value={newTaskAssignee}
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                >
                    <option value="">{t('unassigned')}</option>
                    {assignableUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                </select>
            </div>
            <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={selectedSuggestions.length === 0 && !newTaskTitle.trim()}
                  className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('add')} {selectedSuggestions.length + (newTaskTitle.trim() ? 1 : 0)} {selectedSuggestions.length + (newTaskTitle.trim() ? 1 : 0) !== 1 ? t('tasksLower') : t('taskLower')}
                </button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isEditAreaModalOpen} onClose={() => setIsEditAreaModalOpen(false)} title={t('editArea')}>
        <form onSubmit={handleEditArea} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('areaName')}</label>
            <input 
                type="text" 
                required
                value={editAreaName}
                onChange={e => setEditAreaName(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder={t('egKitchen')}
            />
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition">
                {t('saveChanges')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteTaskModalOpen} onClose={() => setIsDeleteTaskModalOpen(false)} title={t('deleteTask')}>
        <div className="space-y-4">
          <p className="text-gray-700">{t('areYouSureDeleteTask')}</p>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setIsDeleteTaskModalOpen(false)}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-200 transition"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={confirmDeleteTask}
              className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AreaView;