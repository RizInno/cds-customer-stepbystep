using { riz.inno.tutorial as my } from '../db/notification';
using {OP_API_MAINTNOTIFICATION as notifpackage} from './external/OP_API_MAINTNOTIFICATION.csn';

service AdminService {

    entity MaintNotification as projection on my.MaintNotification;
    entity sapMaintNotif as projection on notifpackage.MaintenanceNotification;
}
