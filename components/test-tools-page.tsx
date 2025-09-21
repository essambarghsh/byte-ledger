'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ClientOnly } from '@/components/ui/client-only'
import { Calendar, Clock, TestTube, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export function TestToolsPage() {
  // Testing date/time controls
  const [fakeDate, setFakeDate] = useState<string>('')
  const [currentFakeDate, setCurrentFakeDate] = useState<string | null>(null)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    fetchCurrentFakeDate()
  }, [])

  const fetchCurrentFakeDate = async () => {
    try {
      const response = await fetch('/api/test-date')
      if (response.ok) {
        const data = await response.json()
        setCurrentFakeDate(data.fakeDate)
      }
    } catch (error) {
      console.error('Error fetching fake date:', error)
    }
  }

  const handleSetFakeDate = async () => {
    if (!fakeDate.trim()) {
      toast.error('يرجى إدخال تاريخ ووقت صحيح')
      return
    }

    setTestLoading(true)
    try {
      const response = await fetch('/api/test-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateString: fakeDate }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentFakeDate(data.fakeDate)
        toast.success('تم تعيين التاريخ الوهمي بنجاح')
        setFakeDate('')
      } else {
        toast.error('تاريخ غير صحيح')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setTestLoading(false)
    }
  }

  const handleResetFakeDate = async () => {
    setTestLoading(true)
    try {
      const response = await fetch('/api/test-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateString: null }),
      })

      if (response.ok) {
        setCurrentFakeDate(null)
        toast.success('تم إعادة تعيين التاريخ إلى الوقت الحقيقي')
      } else {
        toast.error('خطأ في إعادة التعيين')
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم')
    } finally {
      setTestLoading(false)
    }
  }

  const handleSetTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(1, 0, 0, 0) // Set to 1:00 AM tomorrow
    const formattedDate = tomorrow.toISOString().slice(0, 16)
    setFakeDate(formattedDate)
  }

  const handleSetNextWeek = () => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(9, 0, 0, 0) // Set to 9:00 AM next week
    const formattedDate = nextWeek.toISOString().slice(0, 16)
    setFakeDate(formattedDate)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            أدوات الاختبار
          </h1>
          <p className="text-muted-foreground mt-1">
            أدوات لاختبار وظائف النظام في بيئة محاكاة
          </p>
        </div>
      </div>

      {/* Warning Card */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-800">تحذير مهم</h3>
              <p className="text-sm text-orange-700 mt-1">
                هذه الأدوات مخصصة للاختبار فقط. لا تستخدمها في بيئة الإنتاج أو مع البيانات الحقيقية.
                تأكد من إعادة تعيين التاريخ إلى الوقت الحقيقي بعد الانتهاء من الاختبار.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            التحكم في التاريخ والوقت
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Date Status */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                حالة التاريخ الحالية
              </span>
            </div>
            <ClientOnly fallback={<p className="text-sm text-yellow-700">جاري التحميل...</p>}>
              <p className="text-sm text-yellow-700">
                {currentFakeDate ? (
                  <>
                    <strong>التاريخ الوهمي:</strong> {new Date(currentFakeDate).toLocaleString('ar-EG')}
                  </>
                ) : (
                  <>
                    <strong>التاريخ الحقيقي:</strong> {new Date().toLocaleString('ar-EG')}
                  </>
                )}
              </p>
            </ClientOnly>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-medium">إجراءات سريعة</h4>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetTomorrow}
                className="text-xs"
              >
                غداً الساعة 1:00 ص
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetNextWeek}
                className="text-xs"
              >
                الأسبوع القادم الساعة 9:00 ص
              </Button>
            </div>
          </div>

          {/* Manual Date Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fakeDate">تعيين تاريخ ووقت مخصص</Label>
              <Input
                id="fakeDate"
                type="datetime-local"
                value={fakeDate}
                onChange={(e) => setFakeDate(e.target.value)}
                placeholder="YYYY-MM-DDTHH:MM"
              />
              <p className="text-xs text-muted-foreground">
                اختر التاريخ والوقت الذي تريد أن يعتقد النظام أنه الوقت الحالي
              </p>
            </div>
            
            <div className="flex flex-col justify-end space-y-2">
              <Button 
                onClick={handleSetFakeDate}
                disabled={testLoading || !fakeDate}
                className="w-full"
              >
                {testLoading ? 'جاري التعيين...' : 'تعيين التاريخ الوهمي'}
              </Button>
              <Button 
                variant="outline"
                onClick={handleResetFakeDate}
                disabled={testLoading}
                className="w-full"
              >
                {testLoading ? 'جاري الإعادة...' : 'إعادة تعيين للوقت الحقيقي'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>دليل الاختبار - مشكلة الأرشفة التلقائية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-3">خطوات اختبار الأرشفة التلقائية:</h4>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li>تأكد من أن التاريخ مضبوط على الوقت الحقيقي</li>
              <li>انتقل إلى لوحة التحكم وأنشئ بعض الفواتير (مدفوعة أو ملغاة)</li>
              <li>عد إلى هذه الصفحة واستخدم &quot;غداً الساعة 1:00 ص&quot; أو اختر تاريخ اليوم التالي</li>
              <li>انتقل إلى لوحة التحكم - ستلاحظ أن الفواتير القديمة اختفت</li>
              <li>انتقل إلى صفحة التاريخ للتأكد من أن الفواتير تم أرشفتها تلقائياً</li>
              <li>عد هنا وأعد تعيين التاريخ للوقت الحقيقي</li>
            </ol>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">النتيجة المتوقعة:</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>لا توجد فواتير &quot;مخفية&quot; أو غير مرئية</li>
              <li>الأرشفة التلقائية تعمل عند تغيير التاريخ</li>
              <li>لوحة التحكم تظهر بيانات نظيفة لليوم الحالي</li>
              <li>الفواتير القديمة متاحة في صفحة التاريخ</li>
              <li>حسابات الرصيد الافتتاحي تعمل بشكل صحيح</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
