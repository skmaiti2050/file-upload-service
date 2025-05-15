import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FileStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'original_filename' })
  originalFilename: string;

  @Column({ name: 'storage_path' })
  storagePath: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.UPLOADED,
  })
  status: FileStatus;

  @Column({ name: 'extracted_data', nullable: true })
  extractedData: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
