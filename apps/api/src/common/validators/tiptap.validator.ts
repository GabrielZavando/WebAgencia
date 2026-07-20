import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { TiptapJSON } from '../../shared/types/tiptap';

/**
 * Maximum allowed size for a Tiptap JSON document (5 MB in bytes).
 */
export const MAX_TIPTAP_CONTENT_SIZE = 5 * 1024 * 1024;

/**
 * Validates that a value is a Tiptap JSON document structure.
 *
 * Requirements:
 * - Must be an object (not a string, number, array, or null)
 * - Must have type === 'doc'
 * - Must have a content property that is an array
 */
export function isTiptapDocument(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const doc = value as TiptapJSON;

  if (doc.type !== 'doc') {
    return false;
  }

  if (!Array.isArray(doc.content)) {
    return false;
  }

  return true;
}

/**
 * Registers a custom validation decorator for Tiptap JSON documents.
 *
 * Usage:
 * ```ts
 * export class CreateArticleDto {
 *   @IsTiptapDocument({ message: 'El contenido debe ser un documento Tiptap válido' })
 *   content: TiptapJSON;
 * }
 * ```
 */
export function IsTiptapDocument(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTiptapDocument',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return isTiptapDocument(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return `El campo ${args.property} debe ser un documento Tiptap válido`;
        },
      },
    });
  };
}

/**
 * Validates that the serialized JSON size of a Tiptap document does not exceed the maximum allowed.
 */
export function isWithinMaxSize(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true; // Let @IsOptional handle nullable cases
  }

  try {
    const serialized = JSON.stringify(value);
    const sizeInBytes = Buffer.byteLength(serialized, 'utf8');
    return sizeInBytes <= MAX_TIPTAP_CONTENT_SIZE;
  } catch {
    return false;
  }
}

/**
 * Registers a custom validation decorator to enforce a maximum size on Tiptap JSON content.
 *
 * Usage:
 * ```ts
 * export class CreateArticleDto {
 *   @IsWithinMaxSize({ message: 'El contenido no puede superar los 5 MB' })
 *   content: TiptapJSON;
 * }
 * ```
 */
export function IsWithinMaxSize(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isWithinMaxSize',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return isWithinMaxSize(value);
        },
        defaultMessage(): string {
          return `El contenido no puede superar los 5 MB`;
        },
      },
    });
  };
}
