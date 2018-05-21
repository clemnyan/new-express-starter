import { Router } from 'express';

import * as User from './controllers/usercontroller';
import { requireAuth, requireSignin } from './services/passport';

const router = Router();

router.get('/', (req, res) => {
  res.send('API is online!');
});
// posts - passed in as data from the front-end
router.post('/signin', requireSignin, User.signin);
router.post('/signup', User.signup);
router.get('/users', requireAuth, User.getUser);


router.route('/users/:id')
  .put(User.updateUser);

export default router;
