using { riz.inno.tutorial as my } from '../db/notification';

service AdminService {

    entity MaintNotification as projection on my.MaintNotification;
}
