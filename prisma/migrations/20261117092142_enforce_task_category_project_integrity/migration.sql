/*
  Warnings:

  - A unique constraint covering the columns `[id,projectId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_categoryId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Category_id_projectId_key" ON "Category"("id", "projectId");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_categoryId_projectId_fkey" FOREIGN KEY ("categoryId", "projectId") REFERENCES "Category"("id", "projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
