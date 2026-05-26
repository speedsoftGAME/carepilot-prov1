import Modal from '../shared/Modal.jsx'
import useStore from '../../store/useStore.js'

export default function SettingsModal({ open, onClose }) {
  const { user, company } = useStore()

  return (
    <Modal open={open} onClose={onClose} title="⚙ Paramètres" size="md">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Compte utilisateur</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Email</span><span>{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Rôle</span><span>{user?.role}</span></div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Entreprise</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Nom</span><span>{company?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Plan</span>
              <span className="font-semibold text-blue-600 uppercase">{company?.plan}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Plans & Tarifs</h3>
          <div className="space-y-2 text-sm">
            {[
              { plan: 'Starter', price: 'Gratuit', features: '3 véhicules · 50 OKCare/mois' },
              { plan: 'Pro', price: '149€/mois', features: 'Illimité · 500 OKCare/mois' },
              { plan: 'Enterprise', price: '399€/mois', features: 'Tout Pro · 9 999 OKCare/mois' },
            ].map(p => (
              <div key={p.plan} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                <div>
                  <div className="font-medium text-slate-800">{p.plan}</div>
                  <div className="text-xs text-slate-500">{p.features}</div>
                </div>
                <span className="text-sm font-semibold text-blue-600">{p.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
