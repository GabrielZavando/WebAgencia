import {
  isTiptapDocument,
  isWithinMaxSize,
  MAX_TIPTAP_CONTENT_SIZE,
} from './tiptap.validator';

describe('Tiptap Validators', () => {
  describe('isTiptapDocument', () => {
    it('should return true for valid Tiptap JSON document', () => {
      const validDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello world',
              },
            ],
          },
        ],
      };

      expect(isTiptapDocument(validDoc)).toBe(true);
    });

    it('should return true for empty Tiptap JSON document', () => {
      const emptyDoc = {
        type: 'doc',
        content: [],
      };

      expect(isTiptapDocument(emptyDoc)).toBe(true);
    });

    it('should return false for null value', () => {
      expect(isTiptapDocument(null)).toBe(false);
    });

    it('should return false for undefined value', () => {
      expect(isTiptapDocument(undefined)).toBe(false);
    });

    it('should return false for string value', () => {
      expect(isTiptapDocument('some text')).toBe(false);
    });

    it('should return false for number value', () => {
      expect(isTiptapDocument(123)).toBe(false);
    });

    it('should return false for array value', () => {
      expect(isTiptapDocument([])).toBe(false);
    });

    it('should return false for object without type property', () => {
      const invalidDoc = {
        content: [],
      };

      expect(isTiptapDocument(invalidDoc)).toBe(false);
    });

    it('should return false for object with wrong type value', () => {
      const invalidDoc = {
        type: 'paragraph',
        content: [],
      };

      expect(isTiptapDocument(invalidDoc)).toBe(false);
    });

    it('should return false for object without content property', () => {
      const invalidDoc = {
        type: 'doc',
      };

      expect(isTiptapDocument(invalidDoc)).toBe(false);
    });

    it('should return false for object with content as non-array', () => {
      const invalidDoc = {
        type: 'doc',
        content: 'not an array',
      };

      expect(isTiptapDocument(invalidDoc)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isTiptapDocument({})).toBe(false);
    });

    it('should return true for complex Tiptap document with marks and attrs', () => {
      const complexDoc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: {
              level: 1,
            },
            content: [
              {
                type: 'text',
                text: 'Title',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Some text with ',
              },
              {
                type: 'text',
                text: 'bold',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
              },
              {
                type: 'text',
                text: ' and ',
              },
              {
                type: 'text',
                text: 'italic',
                marks: [
                  {
                    type: 'italic',
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(isTiptapDocument(complexDoc)).toBe(true);
    });
  });

  describe('isWithinMaxSize', () => {
    it('should return true for small Tiptap document', () => {
      const smallDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Small text',
              },
            ],
          },
        ],
      };

      expect(isWithinMaxSize(smallDoc)).toBe(true);
    });

    it('should return true for null value', () => {
      expect(isWithinMaxSize(null)).toBe(true);
    });

    it('should return true for undefined value', () => {
      expect(isWithinMaxSize(undefined)).toBe(true);
    });

    it('should return false for document larger than 5MB', () => {
      // Create a large document that exceeds 5MB
      const largeText = 'a'.repeat(MAX_TIPTAP_CONTENT_SIZE + 1000);
      const largeDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: largeText,
              },
            ],
          },
        ],
      };

      expect(isWithinMaxSize(largeDoc)).toBe(false);
    });

    it('should return true for document exactly at 5MB limit', () => {
      // Create content that is close to but under 5MB
      const contentSize = MAX_TIPTAP_CONTENT_SIZE - 100; // Leave room for JSON structure
      const largeText = 'a'.repeat(contentSize);
      const largeDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: largeText,
              },
            ],
          },
        ],
      };

      expect(isWithinMaxSize(largeDoc)).toBe(true);
    });

    it('should return false for invalid JSON structures', () => {
      const circularObj: Record<string, any> = {};
      circularObj.self = circularObj;

      expect(isWithinMaxSize(circularObj)).toBe(false);
    });
  });

  describe('MAX_TIPTAP_CONTENT_SIZE', () => {
    it('should be 5MB in bytes', () => {
      expect(MAX_TIPTAP_CONTENT_SIZE).toBe(5 * 1024 * 1024);
    });
  });
});
