# Conditional Fields Documentation

This document explains how to use conditional fields in the dynamic form schema.

## Simple Condition

Show a field only when another field has a specific value:

```json
{
  "name": "primary_production_approach",
  "label": "Primary Production Approach",
  "type": "select",
  "options": ["Decline Curve", "Material Balance", "Hybrid"],
  "defaultValue": "Decline Curve",
  "showIf": {
    "field": "model_level",
    "value": "Pattern Level"
  }
}
```

This field will only be shown when `model_level` equals `"Pattern Level"`.

## Multiple Conditions with AND

Show a field only when ALL conditions are met:

```json
{
  "name": "advanced_primary_settings",
  "label": "Advanced Primary Settings",
  "type": "checkbox",
  "defaultValue": false,
  "showIf": {
    "operator": "AND",
    "conditions": [
      {
        "field": "export_primary",
        "value": true
      },
      {
        "field": "decline_all_layers",
        "value": true
      }
    ]
  }
}
```

This field will only be shown when BOTH `export_primary` is `true` AND `decline_all_layers` is `true`.

## Multiple Conditions with OR

Show a field when ANY condition is met:

```json
{
  "name": "special_option",
  "label": "Special Option",
  "type": "checkbox",
  "defaultValue": false,
  "showIf": {
    "operator": "OR",
    "conditions": [
      {
        "field": "model_type",
        "value": "3-phase"
      },
      {
        "field": "model_level",
        "value": "Well"
      }
    ]
  }
}
```

This field will be shown when EITHER `model_type` is `"3-phase"` OR `model_level` is `"Well"`.

## Examples in Current Schema

### 1. BHP Drawdown
Only shown when BHP Type is "Constant Drawdown Percent":
- Field: `bhp_drawdown`
- Condition: `bhp_type === "Constant Drawdown Percent"`

### 2. Constant BHP Value
Only shown when BHP Type is "Constant BHP":
- Field: `constant_bhp_value`
- Condition: `bhp_type === "Constant BHP"`

### 3. Primary Production Approach
Only shown when Model Level is "Pattern Level":
- Field: `primary_production_approach`
- Condition: `model_level === "Pattern Level"`

### 4. Advanced Primary Settings
Only shown when both Export Primary and Decline All Layers are enabled:
- Field: `advanced_primary_settings`
- Conditions: `export_primary === true AND decline_all_layers === true`

## Supported Field Types

All field types support conditional visibility:
- `text`
- `number`
- `select`
- `checkbox`
- `date`

## Conditional Options in Select Fields

You can also hide specific options within a select field based on other field values:

### Simple Option Hiding

```json
{
  "name": "phase_selection",
  "label": "Phase Selection",
  "type": "select",
  "options": [
    {
      "value": "Oil",
      "hideIf": {
        "field": "model_type",
        "value": "2-phase"
      }
    },
    {
      "value": "Water",
      "hideIf": {
        "field": "model_type",
        "value": "2-phase"
      }
    },
    {
      "value": "Oil-Water"
    }
  ],
  "defaultValue": "Oil"
}
```

In this example:
- When `model_type` is `"2-phase"`, only `"Oil-Water"` will be visible
- When `model_type` is `"3-phase"`, all options will be visible

### Complex Option Hiding with AND/OR

```json
{
  "name": "advanced_option",
  "label": "Advanced Option",
  "type": "select",
  "options": [
    {
      "value": "Option A"
    },
    {
      "value": "Option B",
      "hideIf": {
        "operator": "AND",
        "conditions": [
          {
            "field": "model_type",
            "value": "2-phase"
          },
          {
            "field": "model_level",
            "value": "Layer"
          }
        ]
      }
    }
  ],
  "defaultValue": "Option A"
}
```

This option will be hidden only when BOTH conditions are met.

## Notes

- Fields that are hidden will still maintain their values in the form data
- When a field becomes visible, it will use its `defaultValue`
- Conditions are evaluated in real-time as the user changes form values
- You can nest conditions as deeply as needed using AND/OR operators
- Select options can be either a simple string array or an array of objects with `hideIf` conditions
- Hidden options are completely removed from the select dropdown
- If the currently selected value becomes hidden, the user should select a new visible option
