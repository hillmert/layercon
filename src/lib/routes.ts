export const routes = {
home: '/',
summary: '/summary',
cases: '/cases',
caseDetail: (id: string | number) => `/cases/${id}`,
results: (id: string | number) => `/cases/${id}/results`,
// mantenemos la ruta para crear caso pero NO aparece en la navegación lateral
createCase: '/create_case',
data: '/data',
mapping: '/mapping',
config: '/config'
} as const;