using AdminService as service from '../../srv/admin';

annotate service.MaintNotification with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Nr',
            Value : nr,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Problem Description',
            Value : problemDescription,
        }
    ]
);
annotate service.MaintNotification with @(
    odata.draft.enabled : true,
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'nr',
                Value : nr,
                ![@Common.FieldControl] : #ReadOnly
            },
            {
                $Type : 'UI.DataField',
                Label : 'problemDescription',
                Value : problemDescription,
            },
            {
                $Type : 'UI.DataField',
                Label : 'createdAt',
                Value : createdAt,
            },
            {
                $Type : 'UI.DataField',
                Label : 'createdBy',
                Value : createdBy,
            },
            {
                $Type : 'UI.DataField',
                Label : 'modifiedAt',
                Value : modifiedAt,
            },
            {
                $Type : 'UI.DataField',
                Label : 'modifiedBy',
                Value : modifiedBy,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
    ]
);
