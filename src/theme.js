/**
 * theme.js — AntD v5 ConfigProvider design tokens
 * Bảng màu chủ đạo:
 *   #6C63FF  Electric Violet  (primary brand)
 *   #06B6D4  Cyan Teal        (secondary accent)
 *   #0D0B14  Deep Space       (sidebar dark base)
 *   #F4F3FF  Lavender Mist    (page background)
 *   #10B981  Emerald          (success)
 *   #F59E0B  Amber            (warning)
 *   #EF4444  Red              (error/danger)
 */
const antdTheme = {
    token: {
        /* Brand */
        colorPrimary:            '#6C63FF',
        colorSuccess:            '#10B981',
        colorWarning:            '#F59E0B',
        colorError:              '#EF4444',
        colorInfo:               '#06B6D4',

        /* Layout backgrounds */
        colorBgLayout:           '#F4F3FF',
        colorBgContainer:        '#FFFFFF',

        /* Typography */
        fontFamily:              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize:                14,

        /* Shape */
        borderRadius:            10,
        borderRadiusLG:          14,
        borderRadiusSM:          6,
        borderRadiusXS:          4,

        /* Links */
        colorLink:               '#6C63FF',
        colorLinkHover:          '#4F46E5',
        colorLinkActive:         '#4338CA',

        /* Shadow */
        boxShadow:               '0 4px 20px rgba(108, 99, 255, 0.08)',
        boxShadowSecondary:      '0 8px 32px rgba(108, 99, 255, 0.12)',
    },

    components: {
        Card: {
            borderRadiusLG:        12,
            paddingLG:             20,
        },
        Button: {
            borderRadius:          8,
            fontWeight:            600,
            controlHeight:         38,
            controlHeightLG:       46,
        },
        Input: {
            borderRadius:          8,
            controlHeight:         38,
        },
        InputNumber: {
            borderRadius:          8,
            controlHeight:         38,
        },
        Select: {
            borderRadius:          8,
            controlHeight:         38,
        },
        DatePicker: {
            borderRadius:          8,
            controlHeight:         38,
        },
        Table: {
            borderRadiusLG:        10,
            headerBg:              '#F5F3FF',
            headerColor:           '#4F46E5',
            headerSortActiveBg:    '#EDE9FE',
            headerSortHoverBg:     '#F0EFFE',
        },
        Tag: {
            borderRadius:          6,
            fontSizeSM:            12,
        },
        Modal: {
            borderRadiusLG:        16,
        },
        Menu: {
            darkItemBg:            'transparent',
            darkSubMenuItemBg:     'transparent',
            darkItemSelectedBg:    'rgba(108, 99, 255, 0.22)',
            darkItemHoverBg:       'rgba(255, 255, 255, 0.07)',
            itemBorderRadius:      8,
            darkItemColor:         'rgba(255, 255, 255, 0.65)',
            darkItemSelectedColor: '#ffffff',
            darkItemHoverColor:    '#ffffff',
            darkItemDisabledColor: 'rgba(255,255,255,0.25)',
            darkGroupTitleColor:   'rgba(255,255,255,0.35)',
        },
        Alert: {
            borderRadiusLG:        10,
        },
        Tabs: {
            cardBg:                '#F5F3FF',
            colorBgContainer:      '#F5F3FF',
        },
        Popconfirm: {
            borderRadiusLG:        12,
        },
        Result: {
            borderRadius:          12,
        },
        Descriptions: {
            borderRadiusLG:        10,
        },
        Form: {
            labelColor:            '#374151',
            labelFontSize:         14,
        },
        Badge: {
            borderRadiusSM:        6,
        },
    },
};

export default antdTheme;