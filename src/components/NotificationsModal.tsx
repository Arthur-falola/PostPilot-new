import React from 'react';
import { NotificationItem } from '../types';
import { Bell, X, Bot, TrendingUp, CheckCircle, ExternalLink, Calendar, MousePointerClick } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectRecap?: (item: NotificationItem) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectRecap
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Centre de Notifications</h3>
              <p className="text-[11px] text-slate-500">Récapitulatifs des actions autonomes et alertes trafic</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Tout marquer comme lu
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Aucune notification pour le moment.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.read
                    ? 'bg-white border-slate-200/80'
                    : 'bg-blue-50/40 border-blue-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {item.type === 'autonomous_action' ? (
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </span>
                    ) : item.type === 'traffic_alert' ? (
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-8">
                  {item.message}
                </p>

                {/* Recap Details if autonomous action */}
                {item.recapData && (
                  <div className="mt-3 ml-8 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-2">
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span>Cible : <strong className="text-blue-600">{item.recapData.websiteTarget}</strong></span>
                      <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                        <MousePointerClick className="w-3 h-3" />
                        <span>{item.recapData.clicksGenerated} clics enregistrés</span>
                      </span>
                    </div>

                    {item.recapData.estimatedReach && (
                      <div className="text-slate-500">
                        Portée estimée : <strong className="text-slate-800">{item.recapData.estimatedReach}</strong>
                      </div>
                    )}

                    <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-600 italic line-clamp-2">
                      "{item.recapData.postText}"
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
