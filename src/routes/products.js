import { Router } from "express";

const router = Router();

router.get("/api/products", (req, res) => {
  console.log(req.headers.cookie);
  console.log(req.signedCookies);
  if (req.signedCookies.Hello && req.signedCookies.Hello == "World") {
    return res.json([{ id: 123, name: "Chicken Breast", price: 12.99 }]);
  }

  return res.status(401).send({ msg: "Sorry you need the correct cookies" });
});

export default router;
