import { ImagePlus, FileText, BarChart2, ShoppingCart, HelpCircle } from "lucide-react";

const ActionButtons = ({ onSend }: { onSend: (message: string) => void }) => {
  const actions = [
    { icon: <ImagePlus className="h-4 w-4 text-purple-400" />, label: "Buy Foodstuff", message: "I want to buy foodstuff" },
    { icon: <FileText className="h-4 w-4 text-blue-400" />, label: "Check Prices", message: "I want to check prices" },
    { icon: <BarChart2 className="h-4 w-4 text-green-400" />, label: "Buy Medicine", message: "I want to buy medicine" },
    { icon: <ShoppingCart className="h-4 w-4 text-green-400" />, label: "Market Runs", message: "I want to do a market run" },
    { icon: <HelpCircle className="h-4 w-4 text-red-400" />, label: "Find a Product", message: "I want to find a product" },
  ];

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {actions.map((action) => (
        <button 
          key={action.label} 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={() => onSend(action.message)}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;