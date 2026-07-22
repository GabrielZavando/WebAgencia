import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateLeadDto } from './create-lead.dto';

describe('CreateLeadDto', () => {
  const validDto = {
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    message: 'Me interesa saber más sobre sus servicios',
  };

  it('should pass validation with valid required fields', async () => {
    const dto = plainToInstance(CreateLeadDto, validDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with all optional fields', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validDto,
      phone: '+54 11 1234-5678',
      subject: 'Consulta sobre servicios',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('name', () => {
    it('should fail when name is missing', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        email: validDto.email,
        message: validDto.message,
      });
      const errors = await validate(dto);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should fail when name is empty string', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        name: '',
      });
      const errors = await validate(dto);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should fail when name is less than 2 characters', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        name: 'J',
      });
      const errors = await validate(dto);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should fail when name exceeds 120 characters', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        name: 'A'.repeat(121),
      });
      const errors = await validate(dto);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should pass with exactly 2 characters', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        name: 'AB',
      });
      const errors = await validate(dto);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeUndefined();
    });

    it('should pass with exactly 120 characters', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        name: 'A'.repeat(120),
      });
      const errors = await validate(dto);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeUndefined();
    });
  });

  describe('email', () => {
    it('should fail when email is missing', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        name: validDto.name,
        message: validDto.message,
      });
      const errors = await validate(dto);
      const emailError = errors.find((e) => e.property === 'email');
      expect(emailError).toBeDefined();
    });

    it('should fail when email is invalid format', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        email: 'not-an-email',
      });
      const errors = await validate(dto);
      const emailError = errors.find((e) => e.property === 'email');
      expect(emailError).toBeDefined();
    });

    it('should fail when email is empty string', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        email: '',
      });
      const errors = await validate(dto);
      const emailError = errors.find((e) => e.property === 'email');
      expect(emailError).toBeDefined();
    });
  });

  describe('message', () => {
    it('should fail when message is missing', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        name: validDto.name,
        email: validDto.email,
      });
      const errors = await validate(dto);
      const messageError = errors.find((e) => e.property === 'message');
      expect(messageError).toBeDefined();
    });

    it('should fail when message is less than 10 characters', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        message: 'Short',
      });
      const errors = await validate(dto);
      const messageError = errors.find((e) => e.property === 'message');
      expect(messageError).toBeDefined();
    });

    it('should fail when message is empty string', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        message: '',
      });
      const errors = await validate(dto);
      const messageError = errors.find((e) => e.property === 'message');
      expect(messageError).toBeDefined();
    });

    it('should pass with exactly 10 characters', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        message: '1234567890',
      });
      const errors = await validate(dto);
      const messageError = errors.find((e) => e.property === 'message');
      expect(messageError).toBeUndefined();
    });
  });

  describe('phone (optional)', () => {
    it('should pass without phone', async () => {
      const dto = plainToInstance(CreateLeadDto, validDto);
      const errors = await validate(dto);
      const phoneError = errors.find((e) => e.property === 'phone');
      expect(phoneError).toBeUndefined();
    });

    it('should pass with phone', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        phone: '+54 11 1234-5678',
      });
      const errors = await validate(dto);
      const phoneError = errors.find((e) => e.property === 'phone');
      expect(phoneError).toBeUndefined();
    });
  });

  describe('subject (optional)', () => {
    it('should pass without subject', async () => {
      const dto = plainToInstance(CreateLeadDto, validDto);
      const errors = await validate(dto);
      const subjectError = errors.find((e) => e.property === 'subject');
      expect(subjectError).toBeUndefined();
    });

    it('should pass with subject', async () => {
      const dto = plainToInstance(CreateLeadDto, {
        ...validDto,
        subject: 'Consulta sobre servicios',
      });
      const errors = await validate(dto);
      const subjectError = errors.find((e) => e.property === 'subject');
      expect(subjectError).toBeUndefined();
    });
  });
});
