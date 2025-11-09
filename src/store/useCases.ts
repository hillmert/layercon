import { create } from 'zustand';
import data from '@/mocks/cases.json';


export type CaseStatus = 'idle' | 'running' | 'completed' | 'error';


export interface LayerCase {
id: string;
name: string;
method: 'Darcy 3 phases';
layers: number;
createdAt: string;
status: CaseStatus;
}


interface State {
cases: LayerCase[];
loading: boolean;
error?: string;
addCase: (c: Omit<LayerCase, 'id' | 'createdAt' | 'status'>) => LayerCase;
updateStatus: (id: string, status: CaseStatus) => void;
getById: (id: string) => LayerCase | undefined;
}


function uid() {
return Math.random().toString(36).slice(2, 9);
}


export const useCases = create<State>((set, get) => ({
cases: (data as LayerCase[]),
loading: false,
addCase: (c) => {
const newCase: LayerCase = {
id: uid(),
name: c.name,
method: 'Darcy 3 phases',
layers: c.layers,
createdAt: new Date().toISOString(),
status: 'idle',
};
set(state => ({ cases: [...state.cases, newCase] }));
return newCase;
},
updateStatus: (id, status) => {
set(state => ({
cases: state.cases.map(c => c.id === id ? { ...c, status } : c)
}));
},
getById: (id) => {
return get().cases.find(c => c.id === id);
},
}));