import { z } from "zod";
import { createAggregate, createEntity } from "@maxdev1/sotajs";

// --- Schemas for Form Definition (Static Part) ---

export const FieldValidationSchema = z.object({
	required: z.boolean().optional(),
	minLength: z.number().optional(),
	maxLength: z.number().optional(),
	pattern: z.string().optional(),
	min: z.number().optional(),
	max: z.number().optional(),
	enum: z.array(z.string()).optional(),
});

export const FormFieldSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.enum([
		"string",
		"number",
		"boolean",
		"date",
		"email",
		"phone",
		"select",
		"multiselect",
		"textarea",
		"object",
	]),
	label: z.string(),
	placeholder: z.string().optional(),
	validation: FieldValidationSchema.optional(),
	options: z
		.array(
			z.object({
				value: z.string(),
				label: z.string(),
			}),
		)
		.optional(),
	defaultValue: z.any().optional(),
});

export const FormDefinitionSchema = z.object({
	id: z.string(),
	name: z.string(),
	fields: z.array(FormFieldSchema),
});

// --- Schemas for Form State (Dynamic Part) ---

export const FormFieldValueSchema = z.object({
	value: z.any(),
	isValid: z.boolean(),
	errors: z.array(z.string()),
	touched: z.boolean(),
});

export const FormStateSchema = z.record(z.string(), FormFieldValueSchema);

// --- Main Schema for the SotaJS Entity ---

export const FormEntitySchema = z.object({
	id: z.string(),
	definition: FormDefinitionSchema,
	formState: FormStateSchema,
});

// --- Types ---

export type FormDefinition = z.infer<typeof FormDefinitionSchema>;
export type FormField = z.infer<typeof FormFieldSchema>;
type FormEntityState = z.infer<typeof FormEntitySchema>;

// --- Pure Validation Logic ---

function validateFieldValue(
	field: FormField,
	value: any,
): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (
		field.validation?.required &&
		(value === null || value === undefined || value === "")
	) {
		errors.push(`${field.label} is required`);
		return { isValid: false, errors };
	}

	if (value === null || value === undefined || value === "") {
		return { isValid: true, errors: [] };
	}

	switch (field.type) {
		case "string":
		case "textarea":
			if (typeof value !== "string") {
				errors.push(`${field.label} must be a string`);
				break;
			}
			if (
				field.validation?.minLength !== undefined &&
				value.length < field.validation.minLength
			) {
				errors.push(
					`${field.label} must be at least ${field.validation.minLength} characters`,
				);
			}
			// ... other string validations
			break;
		case "number":
			if (typeof value !== "number") {
				errors.push(`${field.label} must be a number`);
				break;
			}
			// ... other number validations
			break;
		case "email":
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (typeof value !== "string" || !emailRegex.test(value)) {
				errors.push(`${field.label} must be a valid email address`);
			}
			break;
		case "boolean":
			if (typeof value !== "boolean") {
				errors.push(`${field.label} must be a boolean`);
			}
			break;
	}

	if (field.validation?.enum && !field.validation.enum.includes(value)) {
		errors.push(`${field.label} must be one of the allowed values`);
	}

	return { isValid: errors.length === 0, errors };
}

// --- SotaJS Entity Definition ---

export const FormEntity = createAggregate({
	name: "Form",
	schema: FormEntitySchema,
	invariants: [],
	actions: {
		setFieldValue: (
			state: FormEntityState,
			{ fieldId, value }: { fieldId: string; value: any },
		) => {
			const fieldDefinition = state.definition.fields.find(
				(f) => f.id === fieldId,
			);
			if (!fieldDefinition) {
				throw new Error(
					`Field with id ${fieldId} not found in form definition.`,
				);
			}

			const { isValid, errors } = validateFieldValue(fieldDefinition, value);

			state.formState[fieldId] = {
				value,
				isValid,
				errors,
				touched: true,
			};
		},
	},
	computed: {
		isComplete: (state) =>
			state.definition.fields.every((field) => {
				if (!field.validation?.required) return true;
				const fieldValue = state.formState[field.id]?.value;
				return (
					fieldValue !== null && fieldValue !== undefined && fieldValue !== ""
				);
			}),
		isValid: (state) =>
			Object.values(state.formState).every(
				(field: { isValid: boolean }) => field.isValid,
			),
		errors: (state) => {
			const allErrors: Record<string, string[]> = {};
			for (const fieldId in state.formState) {
				if (!state.formState[fieldId].isValid) {
					allErrors[fieldId] = state.formState[fieldId].errors;
				}
			}
			return allErrors;
		},
		data: (state) => {
			const plainData: Record<string, any> = {};
			for (const field of state.definition.fields) {
				plainData[field.name] = state.formState[field.id]?.value;
			}
			return plainData;
		},
	},
});

export type FormEntity = ReturnType<typeof FormEntity.create>;

// --- Custom Factory for easy creation ---

export function createFormFromDefinition(
	definition: FormDefinition,
	instanceId: string,
): FormEntity {
	// 1. Validate the definition itself
	FormDefinitionSchema.parse(definition);

	// 2. Create the initial state
	const initialFormState: z.infer<typeof FormStateSchema> = {};
	for (const field of definition.fields) {
		initialFormState[field.id] = {
			value: field.defaultValue ?? null,
			isValid: true,
			errors: [],
			touched: false,
		};
	}

	// 3. Create the entity instance
	return FormEntity.create({
		id: instanceId,
		definition,
		formState: initialFormState,
	});
}
