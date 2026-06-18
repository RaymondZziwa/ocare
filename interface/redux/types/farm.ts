type SeedlingsJson = {
    id: string;
    name: string;
    plantedQty: number;
    currentQty: number;
    lostQty: number;
}[];
export type SeedlingGrowthStatus =
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED";

export interface SeedlingStages {
  id: string;
  name: string;
  stageDays: number;

  updatedAt: Date;
  createdAt: Date;

  seedlingBatches: SeedlingBatch[];
  seedlingBatchTrackers: SeedlingBatchTracker[];
  seedlingDeaths: SeedlingDeath[];
}

export interface SeedlingBatchTracker {
  id: string;

  batchId: string;
  batch: SeedlingBatch;

  currentStageId: string;
  currentStage: SeedlingStages;

  startDate: Date;
  endDate: Date;

  seedlingsLostAtCurrentStage: SeedlingsJson

  daysToNextStage: number;

  updatedAt: Date;
  createdAt: Date;
}

export interface SeedlingDeath {
  id: string;

  batchId: string;
  batch: SeedlingBatch;

  stageId: string;
  stage: SeedlingStages;

  seedlings: SeedlingsJson

  reason?: string;

  updatedAt: Date;
  createdAt: Date;
}


export interface SeedlingBatch {
  id: string;
  batchNumber: string
  currentStageId: string
  seedlings: SeedlingsJson
  daysSpentInCurrentStage: number;
  status: SeedlingGrowthStatus
  notes?: string
  updatedAt: Date;
 createdAt: Date;
}