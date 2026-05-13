import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, X, CheckCircle2, AlertCircle, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { getEmployees, createEmployeeApi } from '../services/api'

function FieldInput({ label, name, type = 'text', value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--txt-3)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
          style={{ background: 'var(--inset)', border: '1px solid var(--border)', color: 'var(--txt)' }}
          onFocus={e => { e.target.style.borderColor = 'rgba(129,140,248,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.08)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--txt-3)' }}>
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

function CreateModal({ onClose, onCreated }) {
  const [form,    setForm]    = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createEmployeeApi(form)
      onCreated(res.data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Error al crear el empleado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
        className="w-full max-w-md rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)' }}>
              <Plus className="w-4 h-4" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <p className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Nuevo empleado</p>
              <p className="text-[10px]" style={{ color: 'var(--txt-3)' }}>Acceso a la Academia</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--txt-3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--txt)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-3)'}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <FieldInput label="Usuario" name="username" value={form.username} onChange={handleChange}
            placeholder="nombre.apellido" required />
          <FieldInput label="Email" name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="empleado@empresa.com" required />
          <FieldInput label="Contraseña" name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="Mínimo 8 caracteres" required />

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors"
              style={{ background: 'var(--inset)', border: '1px solid var(--border)', color: 'var(--txt-2)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)', color: '#818cf8' }}>
              {loading ? 'Creando...' : 'Crear empleado'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [created,   setCreated]   = useState(null)

  useEffect(() => {
    getEmployees()
      .then(r => setEmployees(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleCreated(emp) {
    setEmployees(prev => [emp, ...prev])
    setShowModal(false)
    setCreated(emp)
    setTimeout(() => setCreated(null), 4000)
  }

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <CreateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>Empleados</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--txt-3)' }}>
              Gestiona las cuentas de acceso a la Academia
            </p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', color: '#818cf8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.1)' }}>
            <Plus className="w-4 h-4" />
            Nuevo empleado
          </button>
        </div>

        {/* Success toast */}
        <AnimatePresence>
          {created && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              <p className="text-sm" style={{ color: 'var(--txt-2)' }}>
                Cuenta creada: <span className="font-bold text-green-400">{created.username}</span> ya puede acceder a la Academia.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <GraduationCap className="w-4 h-4" style={{ color: '#818cf8' }} />
            <span className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Cuentas de empleado</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: 'var(--inset)', color: 'var(--txt-3)', border: '1px solid var(--border)' }}>
              {employees.length}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-7 h-7 rounded-full animate-spin"
                style={{ border: '2px solid rgba(129,140,248,0.15)', borderTopColor: '#818cf8' }} />
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="w-10 h-10 opacity-15" style={{ color: 'var(--txt-3)' }} />
              <p className="text-sm font-bold uppercase tracking-widest opacity-30" style={{ color: 'var(--txt-3)' }}>
                Sin empleados todavía
              </p>
              <button onClick={() => setShowModal(true)}
                className="mt-1 text-xs font-bold transition-colors"
                style={{ color: '#818cf8' }}>
                + Crear el primero
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Usuario', 'Email', 'Estado', 'Alta'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: 'var(--txt-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                            style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', color: '#818cf8' }}>
                            {emp.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold" style={{ color: 'var(--txt)' }}>{emp.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono" style={{ color: 'var(--txt-2)' }}>{emp.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                          style={emp.is_active
                            ? { background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }
                            : { background: 'rgba(244,63,94,0.08)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.2)' }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ background: emp.is_active ? '#4ade80' : '#fb7185' }} />
                          {emp.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono" style={{ color: 'var(--txt-3)' }}>
                        {new Date(emp.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
