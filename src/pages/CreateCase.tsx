import { useState } from 'react';
import Card from '@/components/ui/Card';
import DynamicForm, { type FormTab } from '@/components/DynamicForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { apiRequest, endpoints } from '@/lib/api';
import { DocumentIcon } from '@/components/ui/Icons';
import formSchemaData from '@/config/formSchema.json';

const formSchema = formSchemaData as { tabs: FormTab[] };

export default function CreateCase() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const fieldId = searchParams.get('field') || searchParams.get('project') || '';
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  // Check if project/field is provided
  if (!fieldId) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-4">
            <DocumentIcon className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Project Selected
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please select a project from the home page to create a new simulation.
          </p>
          <button
            onClick={() => nav(routes.home)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Go to Home
          </button>
        </Card>
      </div>
    );
  }

  function downloadInputJson(data: any, caseName: string) {
    // Create a blob with the JSON data
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `input_${caseName.replace(/\s+/g, '_')}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleSubmit(formData: Record<string, any>, files?: Record<string, File>) {
    if (!formData.case_name?.trim()) {
      setError('Simulation name is required');
      return;
    }

    console.log('Uploaded files:', files);

    // Organize data into sections
    const payload = {
      'General Settings': {
        case_name: formData.case_name,
        model_type: formData.model_type,
        model_level: formData.model_level,
        bhp_type: formData.bhp_type,
        producer_bhps: null,
        bhp_drawdown: formData.bhp_drawdown,
        export_primary: formData.export_primary,
        minimum_distance_for_connections: formData.minimum_distance_for_connections,
        cut_primary_after_flooding: formData.cut_primary_after_flooding,
        decline_all_layers: formData.decline_all_layers,
        minimum_primary_decline: formData.minimum_primary_decline,
        connection_lag_months: formData.connection_lag_months,
        units_system: formData.units_system,
      },
      'Standard Densities': {
        oil_density: formData.oil_density,
        water_density: formData.water_density,
        gas_density: formData.gas_density,
      },
      'Oil Properties': {
        b_oil: formData.b_oil,
        c_oil: formData.c_oil,
        pr_oil: formData.pr_oil,
        mu_oil: formData.mu_oil,
        c_mu_oil: formData.c_mu_oil,
        pr_mu_oil: formData.pr_mu_oil,
      },
      'Water Properties': {
        b_water: formData.b_water,
        c_water: formData.c_water,
        pr_water: formData.pr_water,
        mu_water: formData.mu_water,
        c_mu_water: formData.c_mu_water,
        pr_mu_water: formData.pr_mu_water,
      },
      'Expert Configuration': {
        match_gas: formData.match_gas,
        solver_type: formData.solver_type,
        is_uncertain_run: 'None',
        uncertain_parameters: null,
        random_seed: formData.random_seed,
        ensemble_size: formData.ensemble_size,
        allow_increasing_obj: formData.allow_increasing_obj,
        number_of_iterations: formData.number_of_iterations,
        measurement_error_percent_oil: 15.0,
        measurement_error_max_oil: 200.0,
        measurement_error_percent_water: 15.0,
        measurement_error_max_water: 200.0,
        measurement_error_percent_gas: 15.0,
        measurement_error_max_gas: 200.0,
        measurement_p: formData.measurement_p,
        forecast_primary: formData.forecast_primary,
        forecast_years: formData.forecast_years,
        forecast_min_oil: formData.forecast_min_oil,
        forecast_p_decline: formData.forecast_p_decline,
        min_radius: formData.min_radius,
        max_recovery: formData.max_recovery,
        aquifer_transfer_iterations: 1,
        aquifer_transfer_data: null,
      },
    };

    setLoading(true);
    setError(undefined);

    try {
      // Generate and download input.json file
      downloadInputJson(payload, formData.case_name);
      
      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData();
      
      // Add input.json as a file
      const inputJsonBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      formDataToSend.append('input.json', inputJsonBlob, 'input.json');
      
      // Generate a unique GUID for this case
      const guid = crypto.randomUUID();
      
      // Add meta.json as a file
      const metaData = {
        description: `Strateon Run ${formData.case_name} generated under Layercon`,
        displayName: formData.case_name,
        name: guid,
        jobName: `strateon-run-${guid}`,
        workflowTemplate: "strateon-run",
        tags: [guid, "submit"],
        meta: {
          field: fieldId,
          case_name: formData.case_name
        }
      };
      const metaJsonBlob = new Blob([JSON.stringify(metaData, null, 2)], { type: 'application/json' });
      formDataToSend.append('meta.json', metaJsonBlob, 'meta.json');
      
      // Add uploaded files
      if (files) {
        Object.entries(files).forEach(([fieldName, file]) => {
          formDataToSend.append(fieldName, file, file.name);
        });
      }

      // Step 1: Create the workflow
      const result = await apiRequest(endpoints.workflows, {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('Workflow created successfully:', result);
      
      // Step 2: Update workflow state to "Submitted"
      await apiRequest(`${endpoints.workflow}/${guid}`, {
        method: 'PATCH',
        body: JSON.stringify([{ op: "replace", path: "state", value: "Submitted" }]),
      });
      
      // Show success message
      alert(`✅ Simulation "${formData.case_name}" created successfully and submitted!`);
      
      // Redirect to cases page with the field parameter
      nav(`${routes.cases}?project=${fieldId}`);
    } catch (err) {
      console.error('Error creating case:', err);
      setError(err instanceof Error ? err.message : 'Failed to create case. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <DocumentIcon className="w-8 h-8 text-primary dark:text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary dark:text-secondary">
              New Simulation
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Configure your simulation parameters and settings
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-8 shadow-xl">
        <DynamicForm
          schema={formSchema}
          onSubmit={handleSubmit}
          onCancel={() => nav(routes.cases)}
          loading={loading}
          error={error}
        />
      </Card>
    </div>
  );
}
