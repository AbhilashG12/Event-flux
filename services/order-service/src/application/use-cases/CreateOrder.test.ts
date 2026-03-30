import {describe , it , expect , vi} from "vitest";
import { CreateOrder } from "./CreateOrder";


describe("CreateOrder",()=>{
    it("Should create an order and call repository save" , async()=>{
        const mockRepo = { save : vi.fn() , findById : vi.fn()};
        const usecase = new CreateOrder(mockRepo);

        const result = await usecase.execute("user_1" , 100);

        expect(mockRepo.save).toHaveBeenCalled();
        expect(result.userId).toBe("user_1");
    })
})
