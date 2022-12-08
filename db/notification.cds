namespace riz.inno.tutorial;

/**
 * Type definitions for the tutorial application
 */
type User : String(255);


/**
 * Entity definitions for the tutorial application
 */
entity MaintNotification {
    key ID                 : UUID;
        nr                 : String(20);
        problemDescription : String(500) @UI.MultiLineText;
        createdAt          : Timestamp  @cds.on.insert : $now;
        createdBy          : User       @cds.on.insert : $user;
        modifiedAt         : Timestamp  @cds.on.insert : $now   @cds.on.update : $now;
        modifiedBy         : User       @cds.on.insert : $user  @cds.on.update : $user;
}
