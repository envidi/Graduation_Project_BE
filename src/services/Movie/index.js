import { removeService, restoreService, softDeleteService } from "./delete";
import { getAllService, getAllSoftDeleteService, getDetailService } from "./get";
import { updateService } from "./patch";
import { createService } from "./post";


export const movieService = {
    getAllService,
    getDetailService,
    getAllSoftDeleteService,
    createService,
    updateService,
    softDeleteService,
    restoreService,
    removeService
}


