import { Router } from "express";
import { CompanyController } from "../controllers/company.controller.js";

const router = Router();

router.get("/", CompanyController.getByProject);
router.post("/", CompanyController.create);
router.put("/:id", CompanyController.update);
router.delete("/:id", CompanyController.delete);

export default router;

