import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import DashboardOverview from '../components/dashboard/DashboardOverview'
import Medicos from '../components/dashboard/Medicos'
import Leads from '../components/dashboard/Leads'
import Faculdades from '../components/dashboard/Faculdades'
import Instituicoes from '../components/dashboard/Instituicoes'
import Convenios from '../components/dashboard/Convenios'
import Especialidades from '../components/dashboard/Especialidades'

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/medicos" element={<Medicos />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/faculdades" element={<Faculdades />} />
        <Route path="/instituicoes" element={<Instituicoes />} />
        <Route path="/convenios" element={<Convenios />} />
        <Route path="/especialidades" element={<Especialidades />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default Dashboard 