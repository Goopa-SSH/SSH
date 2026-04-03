import { Bell, Trash2, Activity } from "lucide-react";

export const AlertsManager = ({ alerts, currencySymbol, onDelete }) => (
  <div className="bg-[#0A0A0A] border border-[#262626] rounded-sm" data-testid="alerts-tab">
    <div className="p-4 border-b border-[#262626]">
      <p className="font-heading font-bold text-white">Alertes de Prix</p>
      <p className="text-[#737373] text-sm mt-1">
        Notifications quand un prix atteint un seuil
      </p>
    </div>

    {alerts.length === 0 ? (
      <div className="p-16 text-center">
        <Bell className="w-12 h-12 mx-auto text-[#262626] mb-4" />
        <p className="text-white font-heading font-bold">Aucune alerte</p>
        <p className="text-[#737373] text-sm mt-2">
          Creez des alertes depuis la liste des marches
        </p>
      </div>
    ) : (
      <div>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center gap-4 px-4 py-3 border-b border-[#262626] hover:bg-[#111111] transition-colors"
            data-testid={`alert-item-${alert.id}`}
          >
            <Activity
              size={16}
              className={alert.condition === "above" ? "text-[#00FFAA]" : "text-[#FF3B30]"}
            />
            <div className="flex-1">
              <p className="font-heading font-bold text-white text-sm">{alert.crypto_name}</p>
              <p className="text-[#737373] text-xs">
                {alert.condition === "above" ? "Au-dessus de" : "En-dessous de"}{" "}
                <span className="font-mono text-white">
                  {currencySymbol}{alert.target_price.toFixed(2)}
                </span>
              </p>
            </div>
            <button
              onClick={() => onDelete(alert.id)}
              className="p-2 hover:bg-[#FF3B30]/20 rounded-sm transition-colors"
              data-testid={`delete-alert-${alert.id}`}
            >
              <Trash2 size={14} className="text-[#FF3B30]" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);
