const fs = require('fs');
const file = 'src/app/(nasabah)/redeem/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The modal container
content = content.replace(
  'className="bg-white rounded-sm w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-xl"',
  'className="bg-violet-600 rounded-sm w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-xl"'
);

// The modal header
content = content.replace(
  '<div className="bg-violet-600 p-4 text-center">',
  '<div className="p-4 text-center">'
);

// The modal body opening
content = content.replace(
  '{/* Modal Body */}\n            <div className="p-6 flex flex-col items-center">',
  '<div className="bg-white flex-1">\n            {/* Modal Body */}\n            <div className="p-6 flex flex-col items-center">'
);

// The modal footer closing
content = content.replace(
  '              </button>\n            </div>\n          </div>',
  '              </button>\n            </div>\n            </div>\n          </div>'
);

fs.writeFileSync(file, content);
