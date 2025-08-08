import type {
  Answer,
  CustomField,
  PropertyType,
  Question,
  QuestionCategory,
} from "@/lib/evaluation-utils";

// Extended types for the admin panel with full relations
export interface PropertyTypeWithRelations extends PropertyType {
  questionCategories: CategoryWithRelations[];
  customFields?: CustomField[];
}

export interface CategoryWithRelations extends QuestionCategory {
  questions: QuestionWithRelations[];
}

export interface QuestionWithRelations extends Question {
  answers: Answer[];
}

// Form types for creating/editing
export interface CreatePropertyTypeData {
  name_ro: string;
  name_en: string;
}

export interface UpdatePropertyTypeData extends CreatePropertyTypeData {
  id: number;
}

export interface CreateCategoryData {
  name_ro: string;
  name_en: string;
  propertyTypeId: number;
}

export interface UpdateCategoryData extends CreateCategoryData {
  id: number;
}

export interface CreateQuestionData {
  text_ro: string;
  text_en: string;
  weight: number;
  categoryId: number;
}

export interface UpdateQuestionData extends CreateQuestionData {
  id: number;
}

export interface CreateAnswerData {
  text_ro: string;
  text_en: string;
  weight: number;
  questionId: number;
}

export interface UpdateAnswerData extends CreateAnswerData {
  id: number;
}

// Custom Fields types
export interface SelectOption {
  value: string;
  label_ro: string;
  label_en?: string;
}

export interface CreateCustomFieldData {
  propertyTypeId: number;
  label_ro: string;
  label_en?: string;
  fieldType: "text" | "number" | "select" | "textarea" | "date" | "boolean";
  isRequired: boolean;
  placeholder_ro?: string;
  placeholder_en?: string;
  helpText_ro?: string;
  helpText_en?: string;
  selectOptions?: SelectOption[];
  validation?: Record<string, any>;
  sortOrder?: number;
}

export interface UpdateCustomFieldData extends CreateCustomFieldData {
  id: number;
}

// Validation types
export interface ValidationError {
  type:
    | "missing_translation"
    | "missing_answers"
    | "missing_questions"
    | "invalid_weight";
  level: "property_type" | "category" | "question" | "answer";
  id: number;
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
