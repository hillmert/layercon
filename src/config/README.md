# Form Schema - UI Contract

Este directorio contiene los contratos de UI en formato JSON que definen la estructura de los formularios de la aplicación.

## Estructura del Schema

El archivo `formSchema.json` define la estructura completa del formulario de creación de casos mediante un contrato JSON.

### Formato del Schema

```json
{
  "tabs": [
    {
      "id": "tab-id",
      "label": "Tab Label",
      "sections": [
        {
          "title": "Section Title",
          "columns": 2,
          "fields": [...]
        }
      ]
    }
  ]
}
```

### Tipos de Campos Soportados

#### Text Input
```json
{
  "name": "field_name",
  "label": "Field Label",
  "type": "text",
  "required": true,
  "defaultValue": ""
}
```

#### Number Input
```json
{
  "name": "field_name",
  "label": "Field Label",
  "type": "number",
  "step": 0.1,
  "defaultValue": 0
}
```

#### Select Dropdown
```json
{
  "name": "field_name",
  "label": "Field Label",
  "type": "select",
  "options": ["Option 1", "Option 2"],
  "defaultValue": "Option 1"
}
```

#### Checkbox
```json
{
  "name": "field_name",
  "label": "Field Label",
  "type": "checkbox",
  "defaultValue": false
}
```

#### Date Input
```json
{
  "name": "field_name",
  "label": "Field Label",
  "type": "date",
  "required": true,
  "defaultValue": ""
}
```

## Ventajas del Contrato de UI

1. **Separación de Concerns**: La estructura del formulario está separada de la lógica de renderizado
2. **Fácil Mantenimiento**: Cambiar campos solo requiere editar el JSON
3. **Reutilizable**: El componente `DynamicForm` puede usarse con cualquier schema
4. **Versionable**: Los cambios en el formulario se rastrean fácilmente en Git
5. **Backend-Driven**: El schema podría cargarse desde una API en el futuro

## Uso

```tsx
import DynamicForm from '@/components/DynamicForm';
import formSchema from '@/config/formSchema.json';

function MyForm() {
  const handleSubmit = (data: Record<string, any>) => {
    console.log('Form data:', data);
  };

  return (
    <DynamicForm
      schema={formSchema}
      onSubmit={handleSubmit}
      onCancel={() => {}}
      loading={false}
      error={undefined}
    />
  );
}
```
