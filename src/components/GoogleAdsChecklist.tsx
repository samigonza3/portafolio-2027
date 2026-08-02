import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Circle, 
  Target, 
  TrendingUp, 
  Search, 
  Users, 
  BarChart3, 
  Settings, 
  Eye,
  Download,
  Share2
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const checklistData: ChecklistItem[] = [
  // Configuración de Cuenta
  {
    id: 'account-structure',
    title: 'Estructura de cuenta optimizada',
    description: 'Máximo 7-10 grupos de anuncios por campaña, con keywords temáticamente relacionadas',
    category: 'Configuración',
    priority: 'high',
    completed: false
  },
  {
    id: 'conversion-tracking',
    title: 'Seguimiento de conversiones configurado',
    description: 'Google Analytics 4 + Google Ads vinculados, eventos de conversión definidos correctamente',
    category: 'Configuración',
    priority: 'high',
    completed: false
  },
  {
    id: 'enhanced-conversions',
    title: 'Conversiones mejoradas activadas',
    description: 'Implementar enhanced conversions para mejorar la precisión del seguimiento',
    category: 'Configuración',
    priority: 'high',
    completed: false
  },

  // Research y Keywords
  {
    id: 'keyword-research',
    title: 'Research de keywords data-driven',
    description: 'Usar Google Keyword Planner + SEMrush/Ahrefs para identificar términos de alta intención',
    category: 'Keywords',
    priority: 'high',
    completed: false
  },
  {
    id: 'negative-keywords',
    title: 'Lista de keywords negativas robusta',
    description: 'Mínimo 50-100 términos negativos para evitar tráfico irrelevante',
    category: 'Keywords',
    priority: 'high',
    completed: false
  },
  {
    id: 'match-types',
    title: 'Estrategia de concordancia optimizada',
    description: '70% exact match, 20% phrase match, 10% broad match (con Smart Bidding)',
    category: 'Keywords',
    priority: 'medium',
    completed: false
  },

  // Audiencias y Targeting
  {
    id: 'audience-targeting',
    title: 'Segmentación de audiencias avanzada',
    description: 'Combinar in-market + custom audiences + remarketing lists',
    category: 'Audiencias',
    priority: 'high',
    completed: false
  },
  {
    id: 'demographic-exclusions',
    title: 'Exclusiones demográficas definidas',
    description: 'Excluir segmentos con bajo ROAS histórico (ej: 18-24 años si no convierte)',
    category: 'Audiencias',
    priority: 'medium',
    completed: false
  },
  {
    id: 'geographic-targeting',
    title: 'Targeting geográfico preciso',
    description: 'Segmentar por ciudades/regiones con mayor potencial de conversión',
    category: 'Audiencias',
    priority: 'medium',
    completed: false
  },

  // Anuncios y Creatividades
  {
    id: 'ad-variations',
    title: 'Mínimo 3 variaciones de anuncios por grupo',
    description: 'Testear diferentes headlines, descriptions y CTAs para optimizar CTR',
    category: 'Creatividades',
    priority: 'high',
    completed: false
  },
  {
    id: 'responsive-search-ads',
    title: 'Responsive Search Ads optimizados',
    description: '15 headlines + 4 descriptions con keywords principales incluidas',
    category: 'Creatividades',
    priority: 'high',
    completed: false
  },
  {
    id: 'ad-extensions',
    title: 'Extensiones de anuncios completas',
    description: 'Sitelinks, callouts, structured snippets, price extensions activas',
    category: 'Creatividades',
    priority: 'medium',
    completed: false
  },

  // Bidding y Presupuesto
  {
    id: 'smart-bidding',
    title: 'Smart Bidding strategy implementada',
    description: 'Target ROAS o Maximize Conversion Value con datos históricos suficientes',
    category: 'Bidding',
    priority: 'high',
    completed: false
  },
  {
    id: 'budget-allocation',
    title: 'Distribución de presupuesto data-driven',
    description: '80% del budget en campañas con ROAS >300%, 20% en testing',
    category: 'Bidding',
    priority: 'high',
    completed: false
  },
  {
    id: 'dayparting',
    title: 'Programación horaria optimizada',
    description: 'Ajustar bids según horas/días con mayor tasa de conversión',
    category: 'Bidding',
    priority: 'medium',
    completed: false
  },

  // Landing Pages
  {
    id: 'landing-page-relevance',
    title: 'Relevancia keyword-landing page',
    description: 'Keyword principal debe aparecer en H1, URL y primeros 100 caracteres',
    category: 'Landing Pages',
    priority: 'high',
    completed: false
  },
  {
    id: 'page-speed',
    title: 'Velocidad de carga <3 segundos',
    description: 'Usar Google PageSpeed Insights, objetivo: 90+ en mobile y desktop',
    category: 'Landing Pages',
    priority: 'high',
    completed: false
  },
  {
    id: 'mobile-optimization',
    title: 'Optimización mobile-first',
    description: 'Diseño responsive, botones grandes, formularios simplificados',
    category: 'Landing Pages',
    priority: 'high',
    completed: false
  },

  // Monitoreo y Optimización
  {
    id: 'kpi-dashboard',
    title: 'Dashboard de KPIs en tiempo real',
    description: 'Monitorear ROAS, CPA, CTR, Quality Score diariamente',
    category: 'Monitoreo',
    priority: 'high',
    completed: false
  },
  {
    id: 'automated-rules',
    title: 'Reglas automatizadas configuradas',
    description: 'Pausar keywords con CPA >150% del target, aumentar bids en top performers',
    category: 'Monitoreo',
    priority: 'medium',
    completed: false
  },
  {
    id: 'weekly-optimization',
    title: 'Rutina de optimización semanal',
    description: 'Search terms report, bid adjustments, negative keywords, ad testing',
    category: 'Monitoreo',
    priority: 'high',
    completed: false
  }
];

const categories = ['Configuración', 'Keywords', 'Audiencias', 'Creatividades', 'Bidding', 'Landing Pages', 'Monitoreo'];

const categoryIcons = {
  'Configuración': <Settings className="w-5 h-5" />,
  'Keywords': <Search className="w-5 h-5" />,
  'Audiencias': <Users className="w-5 h-5" />,
  'Creatividades': <Eye className="w-5 h-5" />,
  'Bidding': <TrendingUp className="w-5 h-5" />,
  'Landing Pages': <Target className="w-5 h-5" />,
  'Monitoreo': <BarChart3 className="w-5 h-5" />
};

export default function GoogleAdsChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleItem = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const filteredItems = selectedCategory === 'all' 
    ? checklistData 
    : checklistData.filter(item => item.category === selectedCategory);

  const completedCount = checkedItems.size;
  const totalCount = checklistData.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const exportChecklist = () => {
    const checkedItemsData = checklistData.filter(item => checkedItems.has(item.id));
    const uncheckedItemsData = checklistData.filter(item => !checkedItems.has(item.id));
    
    const exportData = {
      completedItems: checkedItemsData,
      pendingItems: uncheckedItemsData,
      progress: `${completedCount}/${totalCount} (${Math.round(progressPercentage)}%)`
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'google-ads-checklist.json';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-purple-900/50 to-cyan-900/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Volver al inicio
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <Target className="w-12 h-12 text-cyan-400" />
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                  Google Ads ROAS+ Checklist
                </h1>
                <p className="text-xl text-gray-300 mt-2">
                  21 elementos críticos para campañas rentables
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Progreso General</span>
                <span className="text-cyan-400 font-bold">{completedCount}/{totalCount}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{Math.round(progressPercentage)}% completado</span>
                <div className="flex gap-4">
                  <button 
                    onClick={exportChecklist}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </button>
                  <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300">
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Todas ({totalCount})
            </button>
            {categories.map(category => {
              const categoryCount = checklistData.filter(item => item.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {categoryIcons[category as keyof typeof categoryIcons]}
                  {category} ({categoryCount})
                </button>
              );
            })}
          </div>

          {/* Checklist Items */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-gray-800/50 border rounded-lg p-6 transition-all hover:bg-gray-800 ${
                  checkedItems.has(item.id) 
                    ? 'border-cyan-500/50 bg-cyan-900/10' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {checkedItems.has(item.id) ? (
                      <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-cyan-400 transition-colors" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${
                        checkedItems.has(item.id) ? 'line-through text-gray-400' : 'text-white'
                      }`}>
                        {item.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                    <p className={`text-gray-300 ${
                      checkedItems.has(item.id) ? 'line-through text-gray-500' : ''
                    }`}>
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm text-purple-400 flex items-center gap-1">
                        {categoryIcons[item.category as keyof typeof categoryIcons]}
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-lg p-8 text-center border border-cyan-500/20">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              ¿Necesitas ayuda implementando esta estrategia?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Cada elemento de este checklist puede marcar la diferencia entre una campaña rentable y una que quema presupuesto. 
              Si quieres acelerar tus resultados con una estrategia personalizada...
            </p>
            <Link
              to="/#contacto"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Hablemos de tu estrategia
              <TrendingUp className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}